import test from 'node:test';
import assert from 'node:assert/strict';
import { firstArticleImage } from './remark-first-article-image.mjs';
const file = { cwd: process.cwd(), path: 'src/content/posts/en/example.md' };
const root = (...children) => ({ type: 'root', children });
const image = (url, alt = '') => ({ type: 'image', url, alt });
test('first image wins, including a linked diagram', () => {
 assert.deepEqual(firstArticleImage(root({ type: 'link', children: [image('/first.svg', 'Diagram')] }, image('/later.png')), file), { src: '/first.svg', alt: 'Diagram' });
});
test('code and plain text do not count as pictures', () => {
 assert.equal(firstArticleImage(root({ type: 'code', value: '![example](/example.png)' }, { type: 'inlineCode', value: '<img src="/example.png">' }, { type: 'text', value: 'Plain article' }), file), undefined);
});
test('image references can precede definitions', () => {
 assert.deepEqual(firstArticleImage(root({ type: 'imageReference', identifier: 'First  Image', alt: 'Reference' }, { type: 'definition', identifier: 'first image', url: '/reference.png' }), file), { src: '/reference.png', alt: 'Reference' });
});
test('HTML images participate in document order and comments do not', () => {
 assert.deepEqual(firstArticleImage(root({ type: 'html', value: '<!-- <img src="/ignored.png"> --><IMG alt="A &amp; B" src="/first.png?a=1&amp;b=2">' }, image('/later.png')), file), { src: '/first.png?a=1&b=2', alt: 'A & B' });
});
test('relative legacy images resolve to imported assets', () => {
 assert.deepEqual(firstArticleImage(root(image('../../../assets/old/a%20b.png', 'Legacy')), file), { src: '../../../assets/old/a%20b.png', alt: 'Legacy', assetPath: '/src/assets/old/a b.png' });
});
test('a cover field does not override the only thumbnail rule', () => {
 const withCover = { ...file, data: { astro: { frontmatter: { cover: '/cover.png' } } } };
 assert.equal(firstArticleImage(root(), withCover), undefined);
 assert.equal(firstArticleImage(root(image('/body.png')), withCover).src, '/body.png');
});
test('external images need no local-file lookup', () => {
 assert.equal(firstArticleImage(root(image('https://example.com/first.png')), file).src, 'https://example.com/first.png');
});

