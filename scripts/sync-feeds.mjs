#!/usr/bin/env node
/**
 * Feed sync — runs in GitHub Actions every 6 hours (and on every push).
 *
 *  - YouTube: fetches each channel's Atom feed (last 15 uploads) and MERGES it into
 *    src/data/youtube/<slug>.json so older videos never disappear.
 *  - Podcast: fetches the RSS from site.config.mjs (podcast.rss) and merges into
 *    src/data/podcast.json by guid.
 *
 * The workflow commits the JSON if anything changed, then builds and deploys.
 * Run locally with `npm run sync`.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import { youtubeChannels, podcast } from '../site.config.mjs';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const DATA = path.join(ROOT, 'src', 'data');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', textNodeName: '#text' });
const now = new Date().toISOString();
let changed = false;

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'azurecentric-sync/1.0 (+https://azurecentric.com)' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.text();
}

async function readJson(file, fallback) {
  if (!existsSync(file)) return fallback;
  return JSON.parse(await readFile(file, 'utf8'));
}

async function writeJsonIfChanged(file, data) {
  const next = JSON.stringify(data, null, 2) + '\n';
  const prev = existsSync(file) ? await readFile(file, 'utf8') : '';
  // ignore lastSynced-only differences
  const strip = (s) => s.replace(/"lastSynced": "[^"]*"/, '');
  if (strip(prev) === strip(next)) return false;
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, next);
  changed = true;
  return true;
}

const arr = (x) => (Array.isArray(x) ? x : x ? [x] : []);
const text = (x) => (typeof x === 'object' && x !== null ? x['#text'] ?? '' : (x ?? ''));

function seriesFor(channel, title) {
  const t = String(title).toLowerCase();
  for (const s of channel.series ?? []) if (s.match.some((m) => t.includes(m.toLowerCase()))) return s.key;
  return undefined;
}

async function syncYouTube() {
  for (const channel of youtubeChannels) {
    const file = path.join(DATA, 'youtube', `${channel.slug}.json`);
    const current = await readJson(file, { channel: channel.slug, channelId: channel.channelId, lastSynced: null, videos: [] });
    try {
      const xml = await fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`);
      const feed = parser.parse(xml).feed;
      const incoming = arr(feed?.entry).map((e) => {
        const media = e['media:group'] ?? {};
        return {
          id: text(e['yt:videoId']),
          title: text(e.title),
          published: text(e.published),
          url: arr(e.link).find((l) => l['@_rel'] === 'alternate')?.['@_href'] ?? `https://www.youtube.com/watch?v=${text(e['yt:videoId'])}`,
          thumbnail: media['media:thumbnail']?.['@_url'] ?? `https://i.ytimg.com/vi/${text(e['yt:videoId'])}/hqdefault.jpg`,
          series: seriesFor(channel, text(e.title)),
          description: String(text(media['media:description'])).slice(0, 300),
        };
      });
      const byId = new Map(current.videos.map((v) => [v.id, v]));
      for (const v of incoming) byId.set(v.id, { ...byId.get(v.id), ...v });
      const videos = [...byId.values()].sort((a, b) => new Date(b.published) - new Date(a.published));
      const wrote = await writeJsonIfChanged(file, { channel: channel.slug, channelId: channel.channelId, lastSynced: now, videos });
      console.log(`youtube/${channel.slug}: ${incoming.length} in feed, ${videos.length} archived${wrote ? ' (updated)' : ''}`);
    } catch (err) {
      console.error(`youtube/${channel.slug}: ${err.message} — keeping existing data`);
    }
  }
}

function parseDuration(d) {
  if (d == null) return undefined;
  const s = String(d).trim();
  if (/^\d+$/.test(s)) return Number(s);
  const parts = s.split(':').map(Number);
  if (parts.some(Number.isNaN)) return undefined;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

async function syncPodcast() {
  if (!podcast.rss) {
    console.log('podcast: no RSS configured (podcast.rss in site.config.mjs) — skipping');
    return;
  }
  const file = path.join(DATA, 'podcast.json');
  const current = await readJson(file, { title: podcast.title, lastSynced: null, episodes: [] });
  try {
    const xml = await fetchText(podcast.rss);
    const ch = parser.parse(xml).rss?.channel;
    const image = ch?.['itunes:image']?.['@_href'] ?? ch?.image?.url;
    const incoming = arr(ch?.item).map((it) => ({
      guid: text(it.guid) || text(it.link),
      number: it['itunes:episode'] ? Number(text(it['itunes:episode'])) : undefined,
      title: text(it.title),
      pubDate: new Date(text(it.pubDate)).toISOString(),
      durationSeconds: parseDuration(text(it['itunes:duration'])),
      audioUrl: it.enclosure?.['@_url'] ?? '',
      link: text(it.link),
      description: String(text(it['itunes:summary']) || text(it.description)).replace(/<[^>]+>/g, '').trim().slice(0, 600),
      image: it['itunes:image']?.['@_href'] ?? image,
    }));
    const byGuid = new Map(current.episodes.map((e) => [e.guid, e]));
    for (const e of incoming) byGuid.set(e.guid, { ...byGuid.get(e.guid), ...e });
    const episodes = [...byGuid.values()].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    const wrote = await writeJsonIfChanged(file, { title: text(ch?.title) || podcast.title, image, lastSynced: now, episodes });
    console.log(`podcast: ${incoming.length} in feed, ${episodes.length} archived${wrote ? ' (updated)' : ''}`);
  } catch (err) {
    console.error(`podcast: ${err.message} — keeping existing data`);
  }
}

await syncYouTube();
await syncPodcast();
// Exit code 3 = "data changed" so the workflow knows to commit. 0 = nothing new.
process.exit(changed ? 3 : 0);
