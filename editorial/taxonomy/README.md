# Categories and tags

Every post has one registered primary category and one to six distinct canonical tags. Categories identify the main subject; tags identify products, features and tasks covered by the article. Incidental product mentions do not justify adding a tag. English and Portuguese translations share their taxonomy.

Categories are registered in `site.config.mjs`, with English and Portuguese labels and an existing icon name. They automatically appear in the existing category navigation, archive pages and RSS feeds as soon as a published article uses them. Tags automatically appear in post chips, tag listings and tag archive pages.

`src/data/tag-aliases.json` records canonical tag names. Use the target spelling in new posts. `src/data/tag-redirects.json` preserves useful old alias URLs in English and Portuguese. The content schema rejects unregistered categories, malformed or duplicate tags, and known tag aliases.

The dated review JSON records every reviewed post, previous and revised metadata, unchanged-body hashes, counts and review limits. Article text is preserved except for two explicitly recorded credential-like VPN/BitLocker sample redactions. Dates, publication flags, images and thumbnail selection remain unchanged.

## Categories added in this review

- Cloud security (`cloud-security`)
- Identity & access (`identity-access`)
- Microsoft Security Copilot (`security-copilot`)
- SIEM & XDR (`siem-xdr`)
- Azure application PaaS (`app-paas`)
- Azure HPC & AI infrastructure (`hpc-ai`)
- Azure hybrid & migration (`hybrid-migration`)
- Azure integration PaaS (`integration`)
- Azure operations & management (`operations`)
- PowerShell (`powershell`)
- High availability (`high-availability`)
- Well-Architected & resilience (`well-architected`)
