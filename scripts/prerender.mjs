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
const exported = icons.filter((icon) => icon.availableInPackage).length;
const facts = `The explorer contains ${icons.length} original SVG icons across ${categories.length} categories, synced from source commit ${config.sourceCommit}. The published npm package ${config.packageName} is v${config.packageVersion} and contains ${exported} icon exports. The main repository can contain newer SVGs than the current npm release. Each catalog record includes availableInPackage so integrations can check actual release availability. Software is MIT licensed; intended CC0 artwork licensing remains subject to contributor rights confirmation.`;
const overview = `# Muslim Icons

> Icons for the Ummah. A free, open-source Muslim and Islamic SVG icon library for developers building apps, websites and design systems for Muslim communities.

Canonical site: ${url}/
Library repository: ${config.repositoryUrl}
Npm package: ${config.packageUrl}

## Collection

${facts}

${categories.map((c) => `- ${c}: ${icons.filter((i) => i.category === c).length} icons`).join("\n")}

## React usage

Install with npm install @muslim-icons/react. The package supports React 18 and 19, TypeScript declarations, size, color, strokeWidth, absoluteStrokeWidth and standard React SVG attributes. Default viewBox: 24×24. Color: currentColor.

\`\`\`tsx
import { Mosque, OpenQuran, PrayerMat } from "@muslim-icons/react";
<Mosque size={24} />
<OpenQuran size={32} color="#28604c" />
<PrayerMat aria-label="Prayer mat" />
\`\`\`

For icons available in the published package, the explorer provides canonical React imports and JSX. Other source-library icons provide SVG markup and downloads. All SVG downloads use the original source artwork.

## Search

Search names, descriptions, categories, tags and aliases. Salah finds prayer icons; tasbih finds prayer beads; fanous finds Ramadan Lantern. Categories combine with search.

## Questions

${faqs.map((f) => `### ${f.question}\n\n${f.answer}`).join("\n\n")}

## Licensing

Software: MIT. Artwork: intended CC0 subject to rights confirmation. Review ${config.repositoryUrl}/blob/main/packages/svg/LICENSE.

## Project links

- [npm package](${config.packageUrl})
- [Library repository](${config.repositoryUrl})
- [React documentation](${config.repositoryUrl}/blob/main/packages/react/README.md)
- [Contributing](${config.repositoryUrl}/blob/main/CONTRIBUTING.md)
- [Ihsan Labs](https://hdfund.org): website attribution.
`;
const compact = `# Muslim Icons

> A free, open-source Muslim and Islamic SVG icon library for developers building digital products for Muslim communities.

${facts}

## Documentation

- [Project overview and React usage](${url}/index.md): API examples, categories, release information and licensing.
- [Icon catalog](${url}/catalog.json): all icons, aliases, source mappings and npm export availability.
- [Complete reference](${url}/llms-full.txt): project overview and full inventory.
- [npm package](${config.packageUrl}): published @muslim-icons/react package.

## Optional

- [Library repository](${config.repositoryUrl}): canonical SVG source and releases.
- [React documentation](${config.repositoryUrl}/blob/main/packages/react/README.md)
- [Contributing](${config.repositoryUrl}/blob/main/CONTRIBUTING.md)
- [Software licence](${config.repositoryUrl}/blob/main/LICENSE)
- [Artwork licensing notes](${config.repositoryUrl}/blob/main/packages/svg/LICENSE)
`;
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
            `- ${i.displayName} (${i.name}) — ${i.category}; status: ${i.status}; SVG: ${url}${i.svgPath}; React export: ${i.availableInPackage ? i.packageComponent : "SVG source"}; aliases: ${i.aliases.join(", ") || "none"}.`,
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
          version: config.packageVersion,
          url: config.packageUrl,
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
