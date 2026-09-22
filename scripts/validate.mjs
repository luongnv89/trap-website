#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = 'https://luongnv.com/trap-website/';
const pages = [
  { file: 'index.html', lang: 'en', canonical: base, mustContain: ['The factory', 'Scan the illustration'] },
  { file: 'vi/index.html', lang: 'vi', canonical: `${base}vi/`, mustContain: ['Nhà máy', 'Quét minh họa'] },
];
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const read = (file) => readFileSync(join(root, file), 'utf8');

function localTarget(pageFile, reference) {
  const pageUrl = new URL(`${base}${pageFile}`);
  const url = new URL(reference, pageUrl);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (url.origin !== new URL(base).origin) return null;
  const path = url.pathname.replace(/^\/trap-website\/?/, '');
  const clean = path || 'index.html';
  const full = join(root, clean);
  if (clean.endsWith('/')) return join(root, clean, 'index.html');
  return full;
}

function localReferences(pageFile, html) {
  const found = [];
  const pattern = /<(?:a|area|link|script|img|source)\b[^>]+(?:href|src)=["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(pattern)) {
    const ref = match[1];
    if (ref.startsWith('#') || ref.startsWith('mailto:') || ref.startsWith('tel:') || ref.startsWith('data:') || ref.startsWith('javascript:')) continue;
    const target = localTarget(pageFile, ref);
    if (target) found.push({ ref, target });
  }
  return found;
}

for (const page of pages) {
  const html = read(page.file);
  check(new RegExp(`<html\\s+lang=["']${page.lang}["']`, 'i').test(html), `${page.file}: html lang must be ${page.lang}`);
  check(html.includes(`<link rel="canonical" href="${page.canonical}">`), `${page.file}: canonical URL is missing or wrong`);
  check(html.includes(`<meta name="description" content="`), `${page.file}: meta description is missing`);
  check(html.includes(`<meta property="og:image" content="${base}assets/social-card.png">`), `${page.file}: absolute social image is missing`);
  check(html.includes(`<meta name="twitter:image" content="${base}assets/social-card.png">`), `${page.file}: twitter image is missing`);
  check(html.includes('<link rel="alternate" hreflang="en"'), `${page.file}: English hreflang is missing`);
  check(html.includes('<link rel="alternate" hreflang="vi"'), `${page.file}: Vietnamese hreflang is missing`);
  check(html.includes('<link rel="alternate" hreflang="x-default"'), `${page.file}: x-default hreflang is missing`);
  check((html.match(/<details\b/g) ?? []).length === 5, `${page.file}: FAQ must contain exactly five questions`);
  for (const marker of page.mustContain) check(html.includes(marker), `${page.file}: expected bilingual marker missing: ${marker}`);
  check(!/href=["'][^"']*(?:play\.google\.com|apps\.apple\.com)[^"']*["']/i.test(html), `${page.file}: store status must not be a live store link`);

  const jsonScripts = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  check(jsonScripts.length === 1, `${page.file}: expected one JSON-LD script`);
  if (jsonScripts.length === 1) {
    try {
      const data = JSON.parse(jsonScripts[0][1]);
      check(data['@type'] === 'VideoGame', `${page.file}: JSON-LD must be VideoGame`);
      check(Array.isArray(data.gamePlatform) && data.gamePlatform.includes('Android') && data.gamePlatform.includes('iOS'), `${page.file}: JSON-LD planned platforms must include Android and iOS`);
      check(!('offers' in data) && !('aggregateRating' in data) && !('review' in data), `${page.file}: JSON-LD must not invent offers, ratings, or reviews`);
    } catch (error) {
      errors.push(`${page.file}: JSON-LD is not valid JSON (${error.message})`);
    }
  }

  for (const { ref, target } of localReferences(page.file, html)) {
    check(existsSync(target), `${page.file}: broken local reference ${ref}`);
  }
  for (const fragment of html.matchAll(/href=["']#([^"']+)["']/gi)) {
    check(new RegExp(`id=["']${fragment[1]}["']`).test(html), `${page.file}: missing fragment target #${fragment[1]}`);
  }
}

const socialCard = join(root, 'assets/social-card.png');
check(existsSync(socialCard), 'assets/social-card.png is missing');
if (existsSync(socialCard)) {
  const png = readFileSync(socialCard);
  const signature = '89504e470d0a1a0a';
  check(png.subarray(0, 8).toString('hex') === signature, 'assets/social-card.png is not a PNG');
  if (png.length >= 24) {
    check(png.readUInt32BE(16) === 1200 && png.readUInt32BE(20) === 630, 'assets/social-card.png must be 1200x630');
  }
}

const sitemap = read('sitemap.xml');
check(sitemap.includes(`${base}</loc>`) && sitemap.includes(`${base}vi/</loc>`), 'sitemap.xml must list both canonical pages');
const robots = read('robots.txt');
check(robots.includes(`Sitemap: ${base}sitemap.xml`), 'robots.txt must point to sitemap.xml');
check(read('llms.txt').includes('not a guarantee of AI ranking'), 'llms.txt must state its factual, non-ranking purpose');
check(read('README.md').includes('not a domain-root robots policy'), 'README must document project-path robots scope');

if (errors.length) {
  console.error(`Static validation failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Static validation passed: ${pages.length} pages, local links/assets, bilingual metadata, JSON-LD, sitemap/robots, and 1200x630 social card.`);
