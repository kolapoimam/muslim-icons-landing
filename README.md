# Muslim Icons landing page

React, TypeScript, Vite and Tailwind website for the [Muslim Icons library](https://github.com/kolapoimam/muslim-icons), deployed at https://muslimicons.vercel.app.

## Development

Node 22 is used by CI and Vercel.

```sh
npm ci
npm run dev
npm test
npm run build
```

The static production output is `dist/`. No backend, authentication or runtime secrets are required. Vercel automatically deploys the connected `main` branch using `vercel.json`.

## Canonical artwork and package

The explorer contains all 104 original SVGs from source commit `0339a71a083f7115a6932cd268bed1616ede3ec2`. Existing explorer names and aliases are preserved, with canonical package mappings; for example `quran-open` maps to `open-quran` and `OpenQuran`. The previous 88 names remain in the registry; 16 additional source icons complete the current library.

The published npm package is `@muslim-icons/react@0.2.1`, which currently exports 95 icons. Source `main` is ahead of that release. `availableInPackage` is verified against the published TypeScript declarations. React code examples are provided for published exports; other source icons expose SVG markup and downloads. The site does not present source-only components as available npm imports.

`src/icons.json` is the central registry for search, aliases, category counts, metadata and import examples. All rendered SVGs match their canonical snapshots byte for byte. `vendor/muslim-icons/provenance.json` records source and npm versions plus SHA-256 checksums. `node scripts/sync-vendored-artwork.mjs` restores public assets from the vendored snapshot. To update the library, refresh the snapshot and registry together, verify npm exports, update provenance/configuration and run tests/build.

## UI and accessibility

Search combines with categories and supports aliases such as salah, tasbih and fanous. `/` focuses search. The detail dialog supports Escape, focus trapping, focus restoration and scroll locking. Size, color, canvas and density controls are live; downloads preserve the chosen size/color. Hover outlines preserve the icon's canvas, color, size and opacity. The single footer row places the Ihsan Labs attribution between the brand and links.

## Search and machine-readable discovery

The build pre-renders the actual React homepage into HTML, then hydrates the same interface. `scripts/verify-discovery.mjs` verifies the complete registry appears in initial HTML, metadata and factual FAQ structured data match the visible content, crawler files exist and share images have correct dimensions.

Generated references: `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llm.txt`, `/llms-full.txt`, `/index.md` and `/catalog.json`. Counts and release information derive from the registry/config. `llms.txt` is a reference proposal, not a ranking or AI citation guarantee.

`src/config.ts` defines the canonical origin. When changing domains, update absolute URLs in `index.html` and the social-card generator too. Site ownership verification and sitemap submission in Google Search Console/Bing Webmaster Tools require the owner's account. Social previews can remain cached until refreshed.

## Branding and licensing

`npm run assets` generates the SVG/PNG/ICO favicon family, Apple icon, web manifest and 1200×630 social-sharing card. The card uses the same canonical SVGs as the explorer. Fontkit outlines the card lettering before Sharp rasterizes it, avoiding host-specific fonts. The interface self-hosts Inter with `font-display: swap`; its OFL notice is in `public/fonts/inter-OFL.txt`.

Software: MIT. Preserve the source project's notices in `vendor/muslim-icons/`. Original artwork licensing is described as intended CC0 1.0 subject to contributor rights confirmation; see the source artwork licence. Trusted local SVGs are rendered as markup; never populate the registry with unreviewed SVG uploads.

## Validation limits

Automated tests cover search, aliases, filters, previews, dialogs, focus, clipboard calls/failures, downloads and hydration. Source fidelity and npm availability are checked against the pinned snapshot. CI tests and builds on Node 22. Live HTTP checks verify production assets and discovery references. Visual browser QA still requires a browser-enabled environment; no screenshot verification is implied.

## Analytics

Google Tag Manager container `GTM-NGWM555W` is installed with its existing GA4 destination `G-93BBGVF37L`. Custom events cover discovery, previews, copying, downloads, links and engagement. The application preserves the container's automatic page views instead of loading a duplicate Google tag. See [analytics events and verification](docs/analytics.md) for the event schema, payload boundaries and GA4 reporting setup.
