# Defender for Cloud series: bilingual publication

Canadian English originals belong in `src/content/posts/en/`; faithful European Portuguese translations belong in `src/content/posts/pt/`. Give each pair the same filename/slug, `translationKey`, category, tags and approved publication timestamp. Translate the title, description, body, alt text and signature; preserve technical meaning and source URLs.

New series posts declare `language: en-CA` or `language: pt-PT`. The existing locale pages render the corresponding content and link to the paired version. The first body image remains the thumbnail. An episode may share its relevant image between translations; the same generic lead image must not be repeated across different episodes.

Episode 1 is approved for the planned 4 November 2026, 11:00 Eastern release. Both files have `draft: false` and a future `pubDate`. The weekly website build follows `America/New_York`; the existing six-hour feed rebuild remains available. GitHub scheduling and deployment can be delayed, so the timestamp is a release target, not a minute-level availability guarantee. Nothing is live until the repository change is merged and the release build deploys after the timestamp.

Only Episode 1 is complete. The remaining 51 articles and their translations must be written, checked and approved before they are added for publication. Do not create empty future posts or publish the outline as an article.

Signatures link to https://www.linkedin.com/in/mdnoga/ . English uses “Cheers” and Portuguese uses “Até à próxima”. No real tenant data, internal slides, fabricated testing claims or new credentials are introduced.
