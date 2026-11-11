import data from "./icons.json";
export const icons = data;
export type IconRecord = (typeof icons)[number];
export const categories = [...new Set(icons.map((icon) => icon.category))];
export const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
export function findIcons(query: string, category = "All Icons") {
  const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
  return icons.filter(
    (icon) =>
      (category === "All Icons" || icon.category === category) &&
      words.every((word) =>
        normalize(
          [
            icon.name,
            icon.displayName,
            icon.description,
            icon.category,
            ...icon.tags,
            ...icon.aliases,
          ].join(" "),
        ).includes(word),
      ),
  );
}
export function importExample(icon: IconRecord) {
  return `import { ${icon.packageComponent ?? icon.componentName} } from "@muslim-icons/react";`;
}
export function jsxExample(icon: IconRecord, size = 24) {
  return `<${icon.packageComponent ?? icon.componentName} size={${size}} />`;
}
