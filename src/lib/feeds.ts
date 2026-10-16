import { youtubeChannels } from '../../site.config.mjs';
import podcastData from '../data/podcast.json';

export type Episode = {
  guid: string;
  title: string;
  number?: number;
  pubDate: string;
  durationSeconds?: number;
  audioUrl?: string;
  link?: string;
  description?: string;
  image?: string;
};

export type Video = {
  id: string;
  title: string;
  published: string;
  url: string;
  thumbnail: string;
  series?: string;
  description?: string;
  durationSeconds?: number;
};

export type Channel = (typeof youtubeChannels)[number];

export function episodes(): Episode[] {
  return [...(podcastData.episodes as Episode[])].sort(
    (a, b) => new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf(),
  );
}

const videoFiles = import.meta.glob('../data/youtube/*.json', { eager: true }) as Record<
  string,
  { default: { videos: Video[] } }
>;

export function videosFor(channelSlug: string): Video[] {
  const entry = Object.entries(videoFiles).find(([path]) => path.endsWith(`/${channelSlug}.json`));
  const list = entry ? entry[1].default.videos : [];
  return [...list].sort((a, b) => new Date(b.published).valueOf() - new Date(a.published).valueOf());
}

export function allVideos(): Array<Video & { channel: Channel }> {
  return youtubeChannels
    .flatMap((channel) => videosFor(channel.slug).map((v) => ({ ...v, channel })))
    .sort((a, b) => new Date(b.published).valueOf() - new Date(a.published).valueOf());
}

export function seriesName(channel: Channel, key?: string): string | undefined {
  return channel.series.find((s) => s.key === key)?.name;
}
