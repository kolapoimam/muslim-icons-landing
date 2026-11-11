import { readFile, writeFile } from "node:fs/promises";
import { render, discovery } from "../work/prerender/prerender.js";
const { graph, site, config, icons, categories, faqs } = discovery();
let html = await readFile("dist/index.html", "utf8");
if (!html.includes('<div id="root"></div>'))
  throw Error("Missing prerender target");
html = html
  .replace('<div id="root"></div>', `<div id="root">${render()}</div>`)
  .replace(
    "</head>",
    `<script type="application/ld+json">${JSON.stringify(graph).replaceAll("<", "\\u003c")}</script>\n</head>`,
  );
await writeFile("dist/index.html", html);
const url = site.url;
const overview = `# Muslim Icons\n\n> Icons for the Ummah. A free, open-source Muslim and Islamic SVG icon library for developers building apps, websites and design systems for Muslim communities.\n\nCanonical site: ${url}/\nLibrary repository: ${config.repositoryUrl}\nPlanned React package: ${config.packageName}. It is not yet published to npm.\n\n## Collection\n\nThe explorer contains ${icons.length} planned entries across ${categories.length} categories. ${icons.filter((i) => i.status === "repository-draft").length} use existing repository draft SVGs and ${icons.filter((i) => i.status === "placeholder").length} are temporary placeholders. None of these labels should be interpreted as final design approval. The source library contains 50 original SVGs; its inventory differs from the 88-entry website plan.\n\n${categories.map((c) => `- ${c}: ${icons.filter((i) => i.category === c).length} entries`).join("\n")}\n\n## React usage\n\nThe source package targets React 18 and 19 with TypeScript declarations. Existing exports include Mosque, Quran, OpenQuran, PrayerMat, Kaaba, Tasbih, QiblaCompass and RamadanLantern. Props include size, color, strokeWidth, absoluteStrokeWidth and standard React SVG attributes. The default design uses a 24x24 viewBox and currentColor.\n\nExamples after the first npm release:\n\n\`\`\`tsx\nimport { Mosque, OpenQuran, PrayerMat } from "@muslim-icons/react";\n<Mosque size={24} />\n<OpenQuran size={32} color="#28604c" />\n<PrayerMat aria-label="Prayer mat" />\n\`\`\`\n\nPlanned icons do not necessarily have existing package exports. Check each entry's packageComponent and packageSlug in the catalog. The upcoming npm install example does not establish namespace availability or publication.\n\n## Search and downloads\n\nSearch names, descriptions, categories, tags and aliases. Examples: salah finds prayer icons; tasbih finds prayer beads; fanous finds Ramadan Lantern; kaaba finds Kaaba. Search combines with category filters. Preview size, color and background, copy imports or JSX, and download the local SVG. Downloads keep draft or placeholder labels.\n\n## Questions\n\n${faqs.map((f) => `### ${f.question}\n\n${f.answer}`).join("\n\n")}\n\n## Licensing and provenance\n\nCode: MIT. Artwork: intended CC0 1.0 subject to contributor rights confirmation. Review ${config.repositoryUrl}/blob/main/packages/svg/LICENSE before production use. The website's source snapshot is ${config.sourceCommit}.\n\n## Project links\n\n- [Explore icons](${url}/#icons)\n- [Documentation](${config.repositoryUrl}/blob/main/packages/react/README.md)\n- [Contributing](${config.repositoryUrl}/blob/main/CONTRIBUTING.md)\n- [Report an issue or request an icon](${config.repositoryUrl}/issues)\n- [Human Development Fund](https://hdfund.org): website footer credit, “Powered by Human Development Fund”.\n`;
const llms = `# Muslim Icons\n\n> A free, open-source Muslim and Islamic icon library for developers building digital products for Muslim communities. Explore SVG icon previews and the React source package.\n\nThe official site is ${url}/. It contains 88 planned icon entries in eight categories, including 43 repository drafts and 45 temporary placeholders. Final artwork is in development. The source library contains 50 original SVGs. The planned npm package @muslim-icons/react is not yet published. Software is MIT licensed; intended CC0 artwork licensing remains subject to rights confirmation. Cite the actual draft/placeholder and release status when describing the collection.\n\n## Documentation\n\n- [Project overview and React usage](${url}/index.md): concise project facts, API examples, categories, licensing and answers.\n- [Icon catalog](${url}/catalog.json): every icon's metadata, aliases, package mapping and artwork status.\n- [Complete project reference](${url}/llms-full.txt): overview plus the full searchable inventory.\n- [React source documentation](${config.repositoryUrl}/blob/main/packages/react/README.md): existing component API.\n\n## Optional\n\n- [Library repository](${config.repositoryUrl}): canonical source code and release updates.\n- [Contribution guidelines](${config.repositoryUrl}/blob/main/CONTRIBUTING.md): original-artwork and review requirements.\n- [Software licence](${config.repositoryUrl}/blob/main/LICENSE): MIT software terms.\n- [Artwork licensing notes](${config.repositoryUrl}/blob/main/packages/svg/LICENSE): intended CC0 subject to contributor rights confirmation.\n`;
const compact = llms;
await Promise.all([
  writeFile("dist/index.md", overview),
  writeFile("dist/llms.txt", compact),
  writeFile("dist/llm.txt", compact),
  writeFile(
    "dist/llms-full.txt",
    overview +
      "\n## Icon inventory\n\n" +
      icons
        .map(
          (i) =>
            `- ${i.displayName} (${i.name}) — ${i.category}; status: ${i.status}; SVG: ${url}${i.svgPath}; React export: ${i.packageComponent ?? "planned, not exported"}; aliases: ${i.aliases.join(", ") || "none"}.`,
        )
        .join("\n") +
      "\n",
  ),
  writeFile(
    "dist/catalog.json",
    JSON.stringify(
      {
        name: "Muslim Icons",
        url: url + "/",
        package: {
          name: config.packageName,
          published: config.packagePublished,
        },
        sourceCommit: config.sourceCommit,
        icons,
      },
      null,
      2,
    ) + "\n",
  ),
  writeFile(
    "dist/robots.txt",
    `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`,
  ),
  writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url}/</loc></url></urlset>\n`,
  ),
]);
console.log(
  `Pre-rendered the homepage and generated discovery documents for ${icons.length} icons.`,
);
