#!/usr/bin/env python3
"""
One-off migration of the old Jekyll blog (_posts/**.markdown) into src/content/posts/en/.

  python3 scripts/migrate-jekyll.py <path-to-old-repo>

What it does
  - maps Jekyll front-matter to the Astro schema: one `category` (10 keys, hand-checked overrides), normalised tags,
    file name (= URL slug) derived from the title, translationKey, cover
  - rewrites /assets/images/... references to relative paths under src/assets/old/ (so Astro optimizes them)
  - converts simple <img> HTML to markdown images, strips <!--more--> and Jekyll leftovers
  - rewrites internal links between old posts to the new /posts/<slug> URLs
  - old permalinks (/YYYY/MM/title.html) are served by src/pages/[year]/[month]/[legacy].html.ts from `legacyUrl`
  - prints a report of unmatched images and category decisions
"""
import re, sys, os, json, shutil, html
from pathlib import Path
from datetime import datetime, timezone
import yaml

OLD = Path(sys.argv[1]).resolve()
ROOT = Path(__file__).resolve().parent.parent
OUT_POSTS = ROOT / 'src/content/posts/en'
OUT_IMG = ROOT / 'src/assets/old'
OUT_STUBS = ROOT / 'public'
OUT_POSTS.mkdir(parents=True, exist_ok=True)

MAX_WIDTH = 1600  # downscale screenshots wider than this

# ---- categories (10). Keyword rules give a first guess; OVERRIDES is the hand-checked final word.
CLOUD_RULES = [
    ('backup-dr',  ['site recovery', 'disaster recovery', ' asr', 'bcdr', 'azure backup', 'backups', 'backup', 'store, backup']),
    ('networking', ['vnet', 'vpn', 'expressroute', 'express route', 'peering', 'load balanc', 'network', 'gateway']),
    ('storage',    ['storsimple', 'managed disk', 'blob', 'vhd', 'storage', 'file sync', 'cdn', 'file share', 'sas token', 'bigger disks']),
    ('governance', ['subscription', 'resource group', 'naming', 'tags', ' tag', 'azure policy', 'governance', 'cost', 'pricing', 'key vault', 'datacenters', 'availability zones']),
    ('automation', ['powershell', 'azure cli', 'cloud shell', 'arm template', 'templates', 'infrastructure as', 'iac', 'automation', 'azure sdk', 'logic apps', 'admin center', 'extensions', 'auto shutdown']),
    ('apps',       ['container', 'docker', 'kubernetes', 'service fabric', 'iot', 'cloud services?']),
    ('compute',    ['virtual machine', 'azure vm', 'compute', 'availability', 'scalability', 'windows virtual desktop', 'hostpool', 'rdp', 'serial console', 'unresponsive', 'redeploy', 'rds license', 'nla', 'update management', 'spot', 'secure your azure', 'error 0x800f081f', 'portal']),
    ('cloud',      ['news', 'announcement', 'azure updates', 'roadmap', 'whitepaper', 'e-book', 'ebook', 'jump start', 'interview', 'innovations', 'what is in azure', 'why ', 'what are we learning', 'enterprise world', 'certification', 'exam', 'mvp', 'cookbook', 'what is a cloud', 'applications', 'cloud innovation', 'move your workloads', 'migrat', 'transform the datacenter', 'on-premises vs']),
]
ONPREM_RULES = [
    ('hyper-v',        ['hyper-v', 'hyper v', 'replica', 'extensible switch', 'generation 2', 'enhanced session', 'virtual hard disk', 'storage qos', 'vsphere', 'live migration', 'virtualization', 'virtualizing', 'virtual machine activation']),
    ('windows-server', ['system center', 'scvmm', 'virtual machine manager', 'scom', 'windows server', 'cluster', 'csv', 'iscsi', 'mpio', 'nic teaming', 'nic team', 'active directory', 'smb', 'sconfig', 'server core', 'network virtualization', 'software defined', 'software-defined', 'powershell']),
]
# keyed by the old file-name slug (what the file is called under src/content/posts/en/)
CATEGORY_OVERRIDES = {

 'how-to-move-your-workloads-to-azure': 'cloud',
 'virtual-machines-hyper-v-vs-azure-iaas': 'compute',
 'managed-disk-on-azure': 'storage',
 'infrastructure-as-a-code-iac-series-the-beginning': 'automation',
 'monitoring-azure-file-sync': 'storage',
 'best-practices-to-architect-resource-groups-in-azure': 'governance',
 'how-to-automate-file-restore-from-an-azure-file-share-snapshot': 'storage',
 'choosing-the-type-of-azure-blob-storage-for-sql-backups': 'storage',
 'containers-on-azure-part-1': 'apps', 'containers-on-azure-part-2': 'apps',
 'virtual-machines-high-availability-on-azure': 'compute',
 'virtual-machine-scalability-in-azure-part-1': 'compute',
 'multiple-subscriptions-monitor-with-one-oms-workspace': 'governance',
 'azure-updates-series-august-2017': 'cloud',
 'azure-resource-manager-powershell-module': 'automation',
 'unresponsive-azure-vm': 'compute',
 'how-to-enable-rds-license-on-an-azure-vm': 'compute',
 'how-to-connect-windows-admin-center-with-azure': 'automation',
 'error-0x800f081f-when-adding-features-on-windows-server-2016-on-azure-virtual-machine': 'compute',
 'azure-spot-virtual-machines': 'compute',
 'software-defined-networking-with-windows-server-and-system-center-jump-start': 'windows-server',
 'azure-innovations-in-the-last-18-months': 'cloud',
 'differences-between-the-classic-and-the-azure-resource-manager-deployment-model': 'governance',
 'how-to-remotely-disable-network-level-authentication-nla-on-azure': 'compute',
 'classic-virtual-machines-in-azure-resource-manager': 'compute',
 'how-to-extend-azure-service-fabric-to-on-premise': 'apps',
 'how-to-configure-azure-logic-apps': 'apps',
 'how-to-remove-a-hostpool-from-the-windows-virtual-desktop-on-azure-2': 'compute',
 'storage-and-continuous-availability-enhancements-in-windows-server-2012': 'windows-server',
 'arm-vs-classic-virtual-machines': 'compute',
 'deploy-a-arm-vm-using-an-existing-vhd-in-azure': 'compute',
 'create-azurerm-vm-from-existing-vhd': 'compute',
 'deploy-arm-templates-using-key-vault': 'automation',
 'azure-availability-zones-and-zone-redundant-storage-hits-ga': 'cloud',
 'azure-policy-auditing-public-blob-storage': 'governance',
 'free-e-books-of-different-microsoft-technologies': 'cloud',
 'free-ebook-introducing-windows-server-2012-r2-preview-release': 'cloud',
 'rtm-for-windows-server-2012-r2': 'cloud',
 'microsoft-system-center-virtual-machine-manager-2012-cookbook': 'cloud',
 'enhancements-azure-portal-notifications': 'cloud',
 'what-is-in-azure': 'cloud',
 'what-is-the-internet-of-things': 'apps',
 'the-difference-between-azure-virtual-machines-and-azure-cloud-services': 'apps',
 'overview-of-nic-teaming-lbfo-in-windows-server-2012': 'windows-server',
 'nic-teaming-on-virtual-machines': 'windows-server',
 'windows-server-2012-nic-teaming-tools-for-troubleshooting': 'windows-server',
 'windows-server-2012-nic-teaming-tools-for-troubleshooting-2': 'windows-server',
 'windows-server-2012-nic-teaming-tools-for-troubleshooting-3': 'windows-server',
 'modifying-a-nic-team-through-gui-and-powershell': 'windows-server',
 'modifying-a-nic-team-through-gui-and-powershell-2': 'windows-server',
 'overview-of-server-virtualization-with-windows-server-2012-r2-2': 'windows-server',
 'overview-of-server-virtualization-with-windows-server-2012-r2-2-2': 'windows-server',
 'overview-of-server-virtualization-with-windows-server-2012-r2': 'windows-server',
 'scom-alert-winrm-is-not-functional-or-not-the-right-version': 'windows-server',
 'cluster-shared-volumes-csv-errors-on-hyper-v-cluster': 'hyper-v',
 'virtualizing-your-data-center-with-hyper-v-and-system-center': 'cloud',
 'how-to-monitor-and-manage-azure-classic-virtual-machines': 'compute',
 'azure-update-management-for-linux-vms': 'compute',
 'multiple-level-alerts-with-arm-template': 'automation',
 'lets-try-to-understand-the-azure-datacenters': 'cloud',
 'how-much-it-cost-azure': 'governance',
 'azure-powershell-to-manage-azure-subscriptions': 'governance',
 'how-to-get-tags-for-all-the-resources-on-the-same-resource-group': 'governance',
 'how-to-update-specified-tag-from-a-resource': 'governance',
 'how-to-overwrite-tags-on-an-azure-resource': 'governance',
 'auto-shutdown-an-azure-vm-with-powershell': 'automation',
 'using-virtual-machine-extensions-to-configure-the-os-on-a-vm': 'automation',
 'using-powershell-to-create-vms-in-azure': 'automation',
 'deploying-virtual-machine-in-azure-using-templates': 'automation',
 'how-to-secure-your-azure-virtual-machine': 'compute',
 'moving-to-azure-series-how-to-get-the-azure-vm-unique-id': 'compute',
 'moving-to-azure-series-error-78007-on-deploying-asr-agent': 'backup-dr',
 'applications-on-premises-vs-cloud': 'cloud',
}

# ---- tags: normalise the 150 old labels into one vocabulary; None = drop
TAG_MAP = {
    # generic / meta labels that classify nothing
    'azure': None, 'cloud': None, 'microsoft-cloud': None, 'cloud-services': None, 'best-practices': None, 'tutorial': None,
    'tools': None, 'news': None, 'announcements': None, 'enhancements': None, 'event': None, 'azure-centric-series': None,
    'moving-to-azure-series': None, 'books': None, 'e-books': None, 'update': None, 'updates': None, 'rollup': None,
    'azure-compute': None, 'azure-vm': None, 'azure-vms': None, 'virtual-machine': None, 'virtual-machines': None,
    'windows-server': None, 'windows-server-2012': None, 'windows-server-2016': None, 'azure-updates': None, 'json': None,
    'automation': None,
    # merges
    'arm': None, 'azure-resource-manager': None, 'asr': 'azure-site-recovery', 'backups': 'backup', 'dr': 'disaster-recovery',
    'scvmm': 'scvmm', 'system-center-virtual-machine-manager': 'scvmm', 'system-center-2012-virtual-machine-manager': 'scvmm',
    'scom': 'scom', 'system-center-operations-manager': 'scom', 'hyper-v-replica-broker': 'hyper-v-replica', 'hyper-va': 'hyper-v',
    'azure-architecture': 'architecture', 'azure-architecure': 'architecture', 'express-route': 'expressroute',
    'azure-networking': 'networking', 'network': 'networking', 'hyper-v-network': 'network-virtualization',
    'hyper-v-network-virtualization': 'network-virtualization', 'azure-storage': 'storage', 'hybrid-storage': 'hybrid',
    'hybrid-cloud': 'hybrid', 'container': 'containers', 'azure-container': 'containers', 'azure-containers': 'containers',
    'internet-of-things': 'iot', 'infrastructure-as-a-code': 'iac', 'azure-cloud-shell': 'cloud-shell', 'managedisks': 'managed-disks',
    'vhdx': 'vhd', 'load-balanced': 'load-balancer', 'azure-load-balance': 'load-balancer', 'cluster': 'failover-cluster',
    'csv': 'cluster-shared-volumes', 'windows-server-core': 'server-core', 'windows-virtual-destop': 'virtual-desktop', 'wvd': 'virtual-desktop',
    'wac': 'windows-admin-center', 'generation-2-virtual-machine': 'generation-2', 'azure-governance': 'governance',
    'azure-logic-apps': 'logic-apps', 'azure-service-fabric': 'service-fabric', 'azure-spot': 'spot-vms', 'acs': 'container-service',
    'azure-file-share': 'azure-files', 'azure-file-sync': 'azure-files', 'wap': 'windows-azure-pack', 'scac': 'app-controller',
    'sdc': 'software-defined-datacenter', 'qos': 'storage-qos', 'bpa': 'best-practices-analyzer', 'best-practices-analyser': 'best-practices-analyzer',
    'encrypteddisk': 'disk-encryption', 'devtest-lab': 'devtest-labs', 'gateway': 'vpn-gateway', 'global-vnet': 'vnet-peering',
    'blob': 'blob-storage', 'permissions': 'rbac', 'azure-portal': 'portal',
}
# tags that only repeat the category they sit in
TAGS_IMPLIED_BY_CATEGORY = {
    'compute': {'high-availability'}, 'networking': {'networking'}, 'storage': {'storage'},
    'backup-dr': {'backup', 'disaster-recovery'}, 'automation': {'azure-automation'}, 'governance': {'governance', 'architecture'},
    'apps': {'containers'}, 'hyper-v': {'hyper-v'}, 'windows-server': {'system-center'}, 'cloud': set(),
}
MAX_TAGS = 6

# ---- file names / URL slugs come from the title (old file names carried WordPress noise: typos, "-2" suffixes)
SLUG_OVERRIDES = {
    'how-does-a-storage-migration-of-a-running-virtual-machine-in-windows-server-2012-both-through-hyper-v-manager-and-through-powershell-actually-work': 'how-storage-migration-of-a-running-vm-works',
    'free-simple-standalone-tool-to-migrate-vms-from-a-vmware-environment-to-hyper-v-in-windows-server-2012': 'mvmc-migrate-vmware-vms-to-hyper-v',
    'update-on-system-center-2012-sp1-update-rollup-2-ur2-for-virtual-machine-manager': 'scvmm-2012-sp1-update-rollup-2',
    'error-0x800f081f-when-adding-features-on-windows-server-2016-on-azure-virtual-machine': 'error-0x800f081f-adding-features-windows-server-2016-azure-vm',
    'how-to-remotely-disable-network-level-authentication-nla-on-azure-virtual-machine': 'remotely-disable-nla-on-azure-vm',
}

def slugify(s):
    s = s.lower().replace("'", '').replace('\u2019', '')  # what's -> whats, not what-s
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s

def pick_category(file_slug, fm, title):
    if file_slug in CATEGORY_OVERRIDES:
        return CATEGORY_OVERRIDES[file_slug]
    text = ' '.join([title] + (fm.get('categories') or []) + (fm.get('tags') or [])).lower()
    mentions_azure = 'azure' in text
    rules = (ONPREM_RULES + CLOUD_RULES) if not mentions_azure else (CLOUD_RULES + ONPREM_RULES)
    for key, needles in rules:
        if any(n in text for n in needles):
            return key
    return 'compute'

# ---- image index (case-insensitive) of what exists in the old repo
img_index = {}
for p in (OLD / 'assets/images').rglob('*'):
    if p.is_file():
        rel = p.relative_to(OLD / 'assets/images').as_posix()
        img_index[rel.lower()] = rel

def resolve_image(url):
    """'/assets/images/posts/2020/11/cnd1.png' -> ('posts/2020/11/cnd1.png' real-case) or None"""
    u = url.split('?')[0].split('#')[0]
    u = re.sub(r'^https?://(www\.)?azurecentric\.com', '', u)
    u = re.sub(r'^/+', '/', u)
    if not u.startswith('/assets/images/') and not u.startswith('assets/images/'):
        return None
    rel = u.replace('/assets/images/', '', 1).replace('assets/images/', '', 1)
    ALIASES = {'posts/2017/11/asr-p2-11.png': 'posts/2017/12/sr-p2-11.png'}
    rel = ALIASES.get(rel.lower(), rel)
    return img_index.get(rel.lower())

copied = set()
def copy_image(rel):
    src = OLD / 'assets/images' / rel
    dst = OUT_IMG / rel
    if rel in copied:
        return dst
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    # downscale very wide screenshots
    try:
        from PIL import Image
        im = Image.open(dst)
        if im.width > MAX_WIDTH and dst.suffix.lower() in ('.png', '.jpg', '.jpeg'):
            ratio = MAX_WIDTH / im.width
            im = im.resize((MAX_WIDTH, int(im.height * ratio)), Image.LANCZOS)
            im.save(dst, optimize=True)
    except Exception as e:
        print('  image warn', rel, e)
    copied.add(rel)
    return dst

# ---- pass 1: collect posts and the old-URL -> new-slug map
posts = []
for f in sorted((OLD / '_posts').rglob('*.m*')):
    s = f.read_text(encoding='utf-8', errors='replace')
    m = re.match(r'^---\n(.*?)\n---\n', s, re.S)
    fm = yaml.safe_load(m.group(1)) or {}
    body = s[m.end():]
    mm = re.match(r'(\d{4})-(\d{2})-(\d{2})-(.+)\.(markdown|md)$', f.name)
    year, month, day, old_title = mm.group(1), mm.group(2), mm.group(3), mm.group(4)
    file_slug = slugify(old_title)
    title = str(fm.get('title', old_title.replace('-', ' '))).strip()
    url_slug = SLUG_OVERRIDES.get(file_slug) or slugify(title)
    posts.append(dict(file=f, fm=fm, body=body, year=year, month=month, day=day, old_title=old_title, file_slug=file_slug, slug=url_slug, title=title))
# duplicate titles get the year appended (the oldest keeps the clean slug)
seen = {}
for p in sorted(posts, key=lambda p: (p['year'], p['month'], p['day'])):
    if p['slug'] in seen:
        p['slug'] = f"{p['slug']}-{p['year']}"
    seen[p['slug']] = True

old_to_new = {}
for p in posts:
    old_to_new[f"/{p['year']}/{p['month']}/{p['old_title']}.html".lower()] = f"/posts/{p['slug']}"
    # wordpress-era permalink variants
    old_to_new[f"/{p['year']}/{p['month']}/{p['day']}/{p['old_title']}/".lower()] = f"/posts/{p['slug']}"
    old_to_new[f"/{p['year']}/{p['month']}/{p['old_title']}/".lower()] = f"/posts/{p['slug']}"

def rewrite_link(url):
    u = re.sub(r'^https?://(www\.|blog\.)?azurecentric\.com', '', url)
    key = u.split('?')[0].split('#')[0].lower()
    if key in old_to_new:
        return old_to_new[key]
    return url

# ---- pass 2: convert
missing_images = []
report = []
for p in posts:
    fm, body, slug, file_slug, title = p['fm'], p['body'], p['slug'], p['file_slug'], p['title']
    rel_prefix = '../../../assets/old/'

    # <!--more--> and kramdown leftovers
    body = body.replace('<!--more-->', '').replace('<!-- more -->', '')
    body = re.sub(r'\{:\s*[^}]*\}', '', body)
    # HTML <img> -> markdown
    def img_html(m):
        tag = m.group(0)
        src = re.search(r'src="([^"]+)"', tag)
        alt = re.search(r'alt="([^"]*)"', tag)
        return f"![{html.unescape(alt.group(1)) if alt else ''}]({src.group(1) if src else ''})"
    body = re.sub(r'<img[^>]*>', img_html, body)
    # strip anchor wrappers around images that link to the same image
    body = re.sub(r'\[(!\[[^\]]*\]\([^)]+\))\]\(([^)]+)\)', r'\1', body)

    # image paths
    def img_md(m):
        alt, url = m.group(1), m.group(2).strip()
        rel = resolve_image(url)
        if rel:
            copy_image(rel)
            return f'![{alt}]({rel_prefix}{rel})'
        if 'assets/images' in url:
            missing_images.append((slug, url))
            return ''  # drop broken local image
        return m.group(0)
    body = re.sub(r'!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)', img_md, body)
    # internal links
    body = re.sub(r'\]\(([^)\s]+)\)', lambda m: f']({rewrite_link(m.group(1))})', body)
    body = re.sub(r'href="([^"]+)"', lambda m: f'href="{rewrite_link(m.group(1))}"', body)
    # old posts used H1 for sections; the page already has the title as H1, so demote one level
    if re.search(r'^# ', body, re.M):
        body = re.sub(r'^(#{1,5}) ', lambda m: '#' + m.group(1) + ' ', body, flags=re.M)
    # collapse 3+ blank lines
    body = re.sub(r'\n{3,}', '\n\n', body).strip() + '\n'

    # description: first real paragraph
    plain = re.sub(r'!\[[^\]]*\]\([^)]*\)', '', body)
    plain = re.sub(r'<[^>]+>', '', plain)
    paras = [x.strip() for x in plain.split('\n\n') if x.strip() and not x.strip().startswith(('#', '>', '|', '```', '*', '-', '1.'))]
    desc = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', paras[0] if paras else title)
    desc = re.sub(r'[*_`]', '', desc).replace('\n', ' ')
    desc = re.sub(r'\s+', ' ', desc).strip()
    if len(desc) > 180:
        desc = desc[:177].rsplit(' ', 1)[0] + '…'

    # category + tags
    category = pick_category(file_slug, fm, title)
    tags = []
    for t in (fm.get('tags') or []) + (fm.get('categories') or []):
        st = slugify(str(t))
        st = TAG_MAP.get(st, st)
        if st and st != category and st not in TAGS_IMPLIED_BY_CATEGORY.get(category, set()) and st not in tags:
            tags.append(st)
    tags = tags[:MAX_TAGS]

    # cover
    cover = None
    for k in ('featured_image', 'featured_image_thumbnail'):
        if fm.get(k):
            rel = resolve_image(str(fm[k]))
            if rel:
                copy_image(rel)
                cover = rel_prefix + rel
                break

    date = fm.get('date')
    if isinstance(date, str):
        date = datetime.fromisoformat(date.replace('+00:00', ''))
    pub = date.strftime('%Y-%m-%d') if hasattr(date, 'strftime') else f"{p['year']}-{p['month']}-{p['day']}"

    def q(s):
        return json.dumps(str(s), ensure_ascii=False)
    front = ['---', f'title: {q(title)}', f'description: {q(desc)}', f'pubDate: {pub}', f'category: {category}',
             f'tags: [{", ".join(tags)}]', f'translationKey: {slug}']
    if cover:
        front.append(f'cover: {cover}')
        front.append(f'coverAlt: {q(title)}')
    front.append('legacy: true')
    front.append(f'legacyUrl: /{p["year"]}/{p["month"]}/{p["old_title"]}.html')
    front.append('---')
    (OUT_POSTS / f'{slug}.md').write_text('\n'.join(front) + '\n\n' + body, encoding='utf-8')

    report.append((slug, category, len(tags), bool(cover)))

print(f'migrated {len(report)} posts, copied {len(copied)} images, {len(missing_images)} missing image refs dropped')
from collections import Counter
print('categories:', Counter(c for _, c, _, _ in report).most_common())
for s, u in missing_images:
    print('  missing:', s, u)
