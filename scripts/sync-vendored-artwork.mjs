import { readFile, copyFile } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const registry = JSON.parse(
  await readFile(new URL("src/icons.json", root), "utf8"),
);
for (const icon of registry) {
  if (icon.packageSlug) {
    await copyFile(
      new URL(
        `vendor/muslim-icons/packages/svg/icons/${icon.packageSlug}.svg`,
        root,
      ),
      new URL(`public${icon.svgPath}`, root),
    );
  }
}
console.log(
  `Synced ${registry.filter((i) => i.packageSlug).length} repository assets. Placeholders unchanged.`,
);
