# Muslim Icons landing page

A React, TypeScript, Vite and Tailwind website for discovering Muslim Icons. The icon explorer is the homepage's primary interface.

## Development

Requires Node 22+.

```sh
npm ci
npm run dev
npm test
npm run build
```

`dist/` is the static production build. No backend, authentication, remote API or published npm package is required to run the site. Vercel auto-deploys the connected production branch. `vercel.json` pins Vite, `npm ci`, the build command and `dist/` output; `package.json` selects Node 22. No environment variables are required.

## Relationship to the library

Library: https://github.com/kolapoimam/muslim-icons

This project follows the library's separate-landing-page decision and React API as of commit `c7c2217292a04a1d96e0f9ad41c65545b817cbba` (11 November 2026). The library's release status is **not yet published to npm**. Installation examples are labelled accordingly; npm namespace availability has not been inferred.

The 88-entry requested inventory contains 43 matching repository SVGs and 45 original temporary placeholders. All 50 source repository SVGs are preserved under `vendor/muslim-icons/packages/svg/icons/`; seven have no matching entry in the requested inventory. Existing artwork is labelled as repository draft artwork, not approved final artwork. Temporary family studies carry inventory markers and are not production designs.

`src/icons.json` is the only icon registry. It powers search, category counts, grid, metadata, code examples and download paths. It explicitly maps planned names such as `quran-open` to existing exports such as `OpenQuran`. For entries absent from the package, examples are identified as planned exports.

## Replace artwork

1. Place the approved SVG at `public/icons/<name>.svg`, keeping the registry's `svgPath` unchanged. Assets use `currentColor`; local SVGs are bundled into the site and downloaded locally.
2. Review the SVG: no scripts, event handlers, remote references, embedded HTML or raster content. `IconArt` renders trusted local SVG markup; do not populate it from untrusted uploads.
3. Update that entry's status, description, tags, `packageSlug` and `packageComponent` in `src/icons.json` as appropriate. Set a package component only if that export actually exists in the library.
4. Run tests and the production build. Vite's local asset glob picks up the new file automatically. No grid or search code needs changing.

For existing vendored assets, `node scripts/sync-vendored-artwork.mjs` copies the matching files back into `public/icons/`. Update the pinned provenance and license notices before replacing the vendor snapshot.

## Configuration

`src/config.ts` contains the library repository URL, landing repository URL, package name, publication status and source commit. Publishing the actual npm package and deploying a website are separate, manual decisions. A repository README describes the package API, but does not prove npm publication.

## Interaction and accessibility

Search includes names, descriptions, category, tags and aliases. `/` focuses search. Search and category filters combine. The detail dialog supports Escape, a focus trap, background scroll locking and focus restoration. Controls preview size, color and canvas; grid density is adjustable. Copy operations report clipboard failures and leave selectable code visible. Downloads contain the selected color and size and retain draft/placeholder filenames.

## Validation

Automated DOM tests cover aliases, category filtering, empty/reset states, canonical React naming, panel focus and keyboard behavior, size/color/canvas previews, clipboard calls and failures, downloads, navigation and density. Every registry asset is checked as valid SVG XML. TypeScript and Vite production compilation are required.

Visual desktop/tablet/mobile layout, real OS clipboard integration and browser download behavior still require browser QA. This environment did not provide the managed browser tools; no visual browser verification is claimed.

## Licensing

Software: MIT, following the original project; see `LICENSE` and `vendor/muslim-icons/LICENSE`.

Existing artwork: preserve `vendor/muslim-icons/packages/svg/LICENSE`. The source repository describes intended CC0 1.0 artwork licensing subject to contributor rights confirmation. New placeholder studies are preview assets pending final design and rights review. Do not treat the collection as cleared final artwork.

Typography uses a self-hosted Inter variable font with `font-display: swap`; no third-party font service is required. Its SIL Open Font License is included at `public/fonts/inter-OFL.txt`.

## Search and machine-readable discovery

The build now pre-renders the same React homepage into `dist/index.html`, including the complete 88-icon grid and visible FAQ answers. The client hydrates it, so the initial content is readable without executing JavaScript. `scripts/verify-discovery.mjs` checks that metadata, structured data, inventory, crawler files and image dimensions are present on every build.

`src/config.ts` defines the canonical production origin. If moving to a custom domain, update it and the absolute metadata URLs in `index.html`, then update the domain caption in the social-card generator. Keep one canonical origin; the sitemap deliberately contains the actual homepage, not fragment URLs or duplicate keyword pages.

Generated endpoints: `/robots.txt`, `/sitemap.xml`, `/llms.txt` (standard spelling), `/llm.txt` (compatibility alias), `/llms-full.txt`, `/index.md`, and `/catalog.json`. These derive from the same icon registry and FAQ content used by the website. `llms.txt` is a project reference proposal, not a guaranteed ranking or AI citation mechanism. The structured data describes the project, source code, website and visible FAQ without invented ratings, downloads or release claims.

Brand assets: `/favicon.svg`, `/favicon.ico`, `/favicon-32.png`, `/apple-touch-icon.png`, `/icon-192.png`, `/icon-512.png`, `/site.webmanifest`, and the 1200×630 `/og-card.png`. `npm run assets` regenerates them. Card typography is converted to vector paths with Fontkit before rasterizing with Sharp, avoiding host-dependent font rendering. The Inter OFL notice is preserved.

After deployment, verify the property in Google Search Console and Bing Webmaster Tools, submit `/sitemap.xml`, and request indexing of the homepage. Site ownership verification requires the owner's account or verification token; this project does not fabricate one. Monitor actual queries and indexing rather than treating technical setup as a ranking guarantee. Social networks may cache old previews until their sharing debugger requests a refresh.
