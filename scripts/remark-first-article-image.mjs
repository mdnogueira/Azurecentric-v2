import { dirname, relative, resolve, sep } from 'node:path';

function decodeAttribute(value) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#(\d+)|#x([\da-f]+));/gi, (entity, decimal, hex) => {
    if (decimal || hex) {
      const point = parseInt(decimal || hex, decimal ? 10 : 16);
      return point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    }
    return { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' }[entity.toLowerCase()] ?? entity;
  });
}

function htmlImage(value) {
  const html = value.replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  for (const match of html.matchAll(/<img\b([^>]*?)(?:\/?>)/gi)) {
    const attrs = {};
    for (const attr of match[1].matchAll(/([^\s=/'">]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+))/g)) {
      attrs[attr[1].toLowerCase()] = decodeAttribute(attr[2] ?? attr[3] ?? attr[4]);
    }
    if (attrs.src?.trim()) return { src: attrs.src.trim(), alt: attrs.alt ?? '' };
  }
}

/** Select the first content image in document order, never a frontmatter override. */
export function firstArticleImage(tree, file) {
  const definitions = new Map();
  const key = (value) => value.trim().replace(/\s+/g, ' ').toLowerCase();
  function collect(node) {
    if (node.type === 'definition') definitions.set(key(node.identifier), node.url);
    for (const child of node.children ?? []) collect(child);
  }
  collect(tree);
  function find(node) {
    if (node.type === 'image' && node.url?.trim()) return { src: node.url.trim(), alt: node.alt ?? '' };
    if (node.type === 'imageReference') {
      const src = definitions.get(key(node.identifier));
      if (src) return { src, alt: node.alt ?? '' };
    }
    if (node.type === 'html') {
      const image = htmlImage(node.value);
      if (image) return image;
    }
    for (const child of node.children ?? []) {
      const image = find(child);
      if (image) return image;
    }
  }
  const image = find(tree);
  if (!image) return;
  if (/^(?:[a-z][a-z\d+.-]*:|\/)/i.test(image.src)) return image;
  const root = file.cwd || process.cwd();
  const path = image.src.split(/[?#]/)[0];
  const assetPath = relative(root, resolve(dirname(resolve(root, file.path)), decodeURIComponent(path))).split(sep).join('/');
  if (assetPath.startsWith('public/')) return { ...image, src: '/' + assetPath.slice(7) };
  return { ...image, assetPath: '/' + assetPath };
}

export default function remarkFirstArticleImage() {
  return (tree, file) => {
    file.data.astro ??= {};
    file.data.astro.frontmatter ??= {};
    file.data.astro.frontmatter.firstArticleImage = firstArticleImage(tree, file);
  };
}

