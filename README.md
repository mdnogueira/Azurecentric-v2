# Azure Centric v2

Static, mobile-first site for [azurecentric.com](https://azurecentric.com): markdown posts in English and Portuguese, the podcast, and every YouTube channel — built with [Astro](https://astro.build) and hosted on **Azure Static Web Apps (Free)**. Feeds are synced by GitHub Actions every 6 hours; there is no server.

## 1. Run it locally

```bash
npm install
npm run dev        # http://localhost:4321 — also reachable from your phone on the LAN address it prints
npm run build      # production build into dist/ + search index
npm run preview    # serve dist/ locally
npm run sync       # pull YouTube + podcast feeds into src/data (merges, never deletes)
```

Node 22 or newer.

## 2. Write a post

Create `src/content/posts/en/<slug>.md` — the file name is the URL (`/posts/<slug>`), so pick it once and keep it:

```md
---
title: "Post title"
description: "One or two sentences. Shown in cards, search and social previews."
pubDate: 2026-10-20
category: networking            # one of: compute, networking, storage, backup-dr, automation, governance, apps, hyper-v, windows-server, cloud
tags: [vnet, azure-cli]          # lowercase-with-dashes; reuse existing tags (see /posts) before inventing new ones
translationKey: my-post          # same value in the PT file links the two
cover: ../../../assets/covers/my-post.jpg   # optional — without it the card shows the logo symbol
coverAlt: "What the image shows"
draft: false
---

Markdown body. Code blocks, tables, images and `<div class="callout">…</div>` are styled.
```

### Publishing

1. Write the file, run `npm run dev` and check it at `http://localhost:4321/posts/<slug>` (drafts and future-dated posts are visible in dev only).
2. `git add . && git commit -m "Post: <title>" && git push`.
3. GitHub Actions builds and deploys to the Static Web App — live in 3–5 minutes. Check the Actions tab if it is not.

Scheduling: set `pubDate` in the future. The post is excluded from production builds until that date; the 6-hourly feed-sync run rebuilds the site, so it appears within 6 hours of the date (push a commit or run the workflow manually to publish it sooner). `draft: true` hides a post regardless of date.

A Portuguese version is optional: copy the file to `src/content/posts/pt/<slug>.md`, keep the same `translationKey`, translate the rest. Posts without a PT version are served in English under `/pt/…` with a small notice.

Categories, the podcast links, the YouTube channels and the site texts live in **`site.config.mjs`**.

### Posts migrated from the old blog

The 226 posts of the Jekyll blog were imported by `scripts/migrate-jekyll.py` (one-off; you do not need to run it again unless you edit the rules and re-import from `C:\_TEMP\_PERSONAL\azurecentric`). What the script did:

- Each old post became `src/content/posts/en/<slug>.md` with `legacy: true` and `legacyUrl: /YYYY/MM/Old-Title.html`. The `legacyUrl` is what keeps old links alive: `src/pages/[year]/[month]/[legacy].html.ts` builds a redirect page at every old address. Other old pages (`/podcast.html`, `/youtube.html`, `/category-*.html`, `/feed.xml`) are 301-redirected in `public/staticwebapp.config.json`.
- Images moved to `src/assets/old/posts/YYYY/MM/` so Astro optimizes them (AVIF/WebP, responsive sizes). Screenshots wider than 1600 px were downscaled.
- Jekyll had 66 free-text labels, several per post; the new site has one `category` per post out of 10. The script assigns it by keyword rules plus a hand-checked override list (`CATEGORY_OVERRIDES`). To re-file a post, edit `category:` in its front-matter; nothing else depends on it.
- The old labels were normalised into one tag vocabulary (`TAG_MAP` in the script: merges like `asr` → `azure-site-recovery`, drops generic ones like `azure`, `cloud`, `best-practices`, `tutorial`, `arm`) and capped at 6 per post. Tags are free text; every tag gets a static page at `/tags/<tag>`.
- File names (= URLs, `/posts/<slug>`) come from the post title, not the old WordPress file names. Old permalinks redirect by `legacyUrl`, so the old links keep working; renaming a file after publishing breaks the *new* link, so don't.
- `description` is the first paragraph of the post, cut to 180 characters. Worth rewriting on the posts you care about: it is what Google, social previews and the cards show.
- Two image references pointed at files that no longer existed in the old repo and were dropped (`2013/05 image.png`, `2013/10 sconfig.png`).

`legacy: true` is informational only (nothing is shown to readers); `legacyUrl` is what drives the redirect, so keep it.

## 3. Push to GitHub

First, one rename (the workflow was delivered as `_github/` because `.github/workflows` can't be written to your disk remotely):

```bash
move _github .github      # PowerShell / cmd on Windows;  mv _github .github  on macOS/Linux
```

Then:

```bash
git init
git add .
git commit -m "Azure Centric v2"
git branch -M main
git remote add origin https://github.com/<you>/azurecentric-v2.git
git push -u origin main
```

A **public** repo gets unlimited Actions minutes; a private one has 2,000 min/month (the 6-hourly sync uses ~120).

## 4. Create the Static Web App (once)

Azure portal → *Create a resource* → **Static Web App**:

| Field | Value |
|---|---|
| Subscription / Resource group | yours (a new RG such as `rg-azurecentric` keeps it tidy) |
| Name | `azurecentric` (becomes `azurecentric.azurestaticapps.net` plus a random suffix) |
| Plan type | **Free** |
| Region | West Europe (closest to readers; only matters for the managed Functions, which we don't use) |
| Deployment source | **Other** |

Choose **Other**, not GitHub. The GitHub option makes the portal commit its own workflow file into the repo and create a secret with a random suffix; you would then have two workflows deploying on every push and have to delete one. With **Other**, the portal creates nothing in the repo and our `.github/workflows/site.yml` is the only deployer.

After *Create*:

1. Portal → the Static Web App → *Overview* → **Manage deployment token** → copy the token.
2. GitHub → the repo → *Settings → Secrets and variables → Actions → New repository secret*: name **`AZURE_STATIC_WEB_APPS_API_TOKEN`**, value = the token.
3. Push a commit (or *Actions → Sync feeds, build and deploy → Run workflow*). The run takes 4–6 minutes; the site is then live at the URL shown on the SWA *Overview* page.

There is nothing else to configure on the SWA itself. Build settings do not apply (the workflow builds and uploads `dist`), routing, headers and redirects come from `public/staticwebapp.config.json`, and HTTPS is automatic. If you ever pick the GitHub source by mistake: delete the generated `.github/workflows/azure-static-web-apps-*.yml`, and copy the value of the generated `AZURE_STATIC_WEB_APPS_API_TOKEN_<NAME>` secret into a secret named exactly `AZURE_STATIC_WEB_APPS_API_TOKEN`.

## 5. Custom domain

SWA → *Custom domains* → add `azurecentric.com` and `www.azurecentric.com`. At your DNS provider:

- `TXT` record the portal shows (ownership check)
- `www` → `CNAME` to `<name>.azurestaticapps.net`
- apex `azurecentric.com` → `ALIAS`/`ANAME` to the same host, or an `A` record if your provider has no ALIAS (the portal shows the IP)

Certificates are issued automatically; allow up to an hour.

## 6. Feeds

- **YouTube** — one entry per channel in `youtubeChannels` (`site.config.mjs`). The channel RSS only exposes the last 15 uploads, so `src/data/youtube/<slug>.json` is an archive that the sync merges into; it is committed by the workflow.
- **Podcast** — set `podcast.rss` to the Spotify for Creators feed URL. Until then the site uses `src/data/podcast.json` as seeded.
- Schedule: `17 */6 * * *` in `.github/workflows/site.yml`. GitHub disables scheduled workflows on public repos after 60 days without activity; the sync's own commits count as activity.

## 7. Security headers and caching

`public/staticwebapp.config.json` → CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy, long cache on hashed assets, 404 rewrite, `trailingSlash: never`. If you embed a new third-party host (another podcast CDN, for example), add it to `media-src` / `img-src` there.

## Layout

```
site.config.mjs            your names, links, channels, categories
src/content/posts/{en,pt}  markdown posts
src/data/                  synced feed archives (committed)
src/pages/                 routes (EN; /pt/* is generated with fallback)
src/components/, layouts/  UI
src/styles/global.css      design tokens (logo colours) + navy/light themes
scripts/sync-feeds.mjs     feed sync
.github/workflows/site.yml sync → build → deploy
public/staticwebapp.config.json  SWA routing + headers
```
