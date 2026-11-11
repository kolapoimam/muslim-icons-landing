import { readFile, stat } from "node:fs/promises";
import assert from "node:assert/strict";
import sharp from "sharp";
const registry = JSON.parse(await readFile("src/icons.json", "utf8"));
const html = await readFile("dist/index.html", "utf8");
assert.match(
  html,
  /<main>/,
  "Homepage must have rendered content before JavaScript",
);
assert.equal(
  (html.match(/class="icon-card"/g) || []).length,
  registry.length,
  "All library icons must be present in the initial HTML",
);
assert.match(html, /Muslim and Islamic icons/);
assert.match(html, /https:\/\/hdfund.org/);
assert.match(
  html,
  /<link rel="canonical" href="https:\/\/muslimicons.vercel.app\/"/,
);
for (const key of [
  "og:image",
  "og:image:width",
  "og:image:height",
  "twitter:card",
])
  assert.ok(html.includes(`"${key}"`));
const jsonld = JSON.parse(
  html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1],
);
const faq = jsonld["@graph"].find((x) => x["@type"] === "FAQPage");
for (const q of faq.mainEntity) {
  assert.ok(html.includes(q.name));
  assert.ok(
    html.includes(
      q.acceptedAnswer.text.replaceAll("&", "&amp;").replaceAll("'", "&#x27;"),
    ),
  );
}
const catalog = JSON.parse(await readFile("dist/catalog.json", "utf8"));
assert.equal(catalog.icons.length, registry.length);
assert.equal(catalog.package.published, true);
for (const file of [
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "llm.txt",
  "llms-full.txt",
  "index.md",
  "favicon.svg",
  "favicon.ico",
  "apple-touch-icon.png",
  "site.webmanifest",
])
  assert.ok((await stat("dist/" + file)).size > 0, file);
assert.match(await readFile("dist/llms.txt", "utf8"), /^# Muslim Icons/);
assert.match(await readFile("dist/llms.txt", "utf8"), /published npm package/);
const image = await sharp("dist/og-card.png").metadata();
assert.equal(image.width, 1200);
assert.equal(image.height, 630);
for (const [file, size] of [
  ["favicon-32.png", 32],
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
]) {
  const info = await sharp("dist/" + file).metadata();
  assert.equal(info.width, size);
  assert.equal(info.height, size);
}
console.log(
  "Discovery checks passed: crawlable HTML, canonical library icons, factual structured data, crawler files, metadata and share-image dimensions.",
);
