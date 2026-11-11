import { readFile, writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";
import { openSync } from "fontkit";
const font = openSync(
  new URL(
    "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
    import.meta.url,
  ).pathname,
);
const escape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
function text(value, x, y, size, color = "#253d31", weight = 450) {
  const face = font;
  const run = face.layout(value);
  const scale = size / face.unitsPerEm;
  let advance = 0;
  const paths = run.glyphs
    .map((glyph, i) => {
      const pos = run.positions[i];
      const svg = `<path transform="translate(${x + (advance + pos.xOffset) * scale} ${y - pos.yOffset * scale}) scale(${scale} ${-scale})" d="${glyph.path.toSVG()}"/>`;
      advance += pos.xAdvance;
      return svg;
    })
    .join("");
  return `<g fill="${color}" aria-label="${escape(value)}">${paths}</g>`;
}
const mark = `<rect width="64" height="64" rx="16" fill="#28604c"/><g fill="#fafbf7"><rect x="15" y="15" width="14" height="14" rx="3"/><rect x="35" y="15" width="14" height="14" rx="3"/><rect x="15" y="35" width="14" height="14" rx="3"/><path d="M35 35h14v5a9 9 0 0 1-9 9h-5z"/></g>`;
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><title>Muslim Icons</title>${mark}</svg>`;
await mkdir("public", { recursive: true });
await writeFile("public/favicon.svg", favicon);
for (const [file, size] of [
  ["favicon-32.png", 32],
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
])
  await sharp(Buffer.from(favicon))
    .resize(size, size)
    .png()
    .toFile("public/" + file);
const png = await readFile("public/favicon-32.png");
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header[6] = 32;
header[7] = 32;
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18);
await writeFile("public/favicon.ico", Buffer.concat([header, png]));
const names = [
  "mosque",
  "quran-open",
  "kaaba",
  "prayer-mat",
  "ramadan-lantern",
  "prayer-beads",
  "hijab",
  "eid-gift",
  "qibla",
];
let specimens = "";
for (const [i, name] of names.entries()) {
  const svg = await readFile(`public/icons/${name}.svg`, "utf8");
  const body = svg
    .replace(/<svg[^>]*>/, "")
    .replace("</svg>", "")
    .replace(/<title>.*?<\/title>/, "");
  specimens += `<svg x="${800 + (i % 3) * 116}" y="${191 + Math.floor(i / 3) * 99}" width="47" height="47" viewBox="0 0 24 24" fill="none" stroke="#365840" color="#365840" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><title>Muslim Icons — Icons for the Ummah</title><rect width="1200" height="630" fill="#fafbf7"/><rect x="0" y="0" width="1200" height="8" fill="#28604c"/><g transform="translate(64 57) scale(.72)">${mark}</g>${text("muslimicons", 126, 91, 28, "#253d31", 600)}${text("A PURPOSE-BUILT, OPEN-SOURCE ICON LIBRARY", 67, 166, 12, "#6d7b64", 550)}${text("Icons for", 62, 264, 90, "#253d31", 500)}${text("the Ummah.", 62, 358, 90, "#28604c", 500)}${text("Muslim & Islamic icons for", 67, 422, 25, "#65745f")}${text("the things you’re building.", 67, 459, 25, "#65745f")}<rect x="67" y="497" width="125" height="32" rx="16" fill="#eaf0e4"/><rect x="203" y="497" width="125" height="32" rx="16" fill="#eaf0e4"/>${text("SVG + React", 83, 518, 14, "#41603c", 500)}${text("Open source", 219, 518, 14, "#41603c", 500)}<rect x="752" y="143" width="384" height="377" rx="16" fill="#edf1e8" stroke="#dce5d5"/>${text("THE COLLECTION", 780, 171, 10, "#6d7b64", 550)}<path d="M885 194v276M1001 194v276M780 275h329M780 374h329" stroke="#d9e2d2"/>${specimens}${text("PREVIEW ARTWORK · MADE WITH INTENTION", 783, 496, 10, "#6d7b64", 500)}<path d="M64 568h1072" stroke="#dde4d6"/>${text("muslimicons.vercel.app", 66, 601, 16, "#4b6446", 500)}${text("Icons for communities. Open to everyone.", 822, 600, 12, "#6d7b64")}</svg>`;
await writeFile("public/og-card.svg", svg);
await sharp(Buffer.from(svg)).png().toFile("public/og-card.png");
await writeFile(
  "public/site.webmanifest",
  JSON.stringify(
    {
      name: "Muslim Icons",
      short_name: "Muslim Icons",
      description: "Muslim and Islamic SVG icons for developers.",
      start_url: "/",
      display: "browser",
      background_color: "#fafbf7",
      theme_color: "#28604c",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Generated the 1200×630 sharing card and favicon family. Card typography is outlined for portable rendering.",
);
