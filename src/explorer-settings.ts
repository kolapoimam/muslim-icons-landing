import { categories } from "./registry";
export const strokeWeights = {
  thin: 1,
  light: 1.5,
  regular: 2,
  bold: 3,
} as const;
export type StrokeWeight = keyof typeof strokeWeights;
export type Availability = "all" | "npm" | "svg";
export type SortOrder = "collection" | "name-asc" | "name-desc";
export type ExplorerSettings = {
  query: string;
  category: string;
  size: number;
  color: string;
  background: string;
  weight: StrokeWeight;
  density: "comfortable" | "compact";
  availability: Availability;
  sort: SortOrder;
};
export const defaultSettings: ExplorerSettings = {
  query: "",
  category: "All Icons",
  size: 32,
  color: "#293e35",
  background: "#ffffff",
  weight: "regular",
  density: "comfortable",
  availability: "all",
  sort: "collection",
};
export const canvasColors = ["#ffffff", "#f3f4ee", "#202b27"] as const;
export function normalizeHex(value: string): string | null {
  const text = value.trim().replace(/^#/, "");
  if (/^[a-f\d]{3}$/i.test(text))
    return (
      "#" +
      text
        .split("")
        .map((c) => c + c)
        .join("")
        .toLowerCase()
    );
  return /^[a-f\d]{6}$/i.test(text) ? "#" + text.toLowerCase() : null;
}
export function readableInk(background: string) {
  const rgb = background
    .slice(1)
    .match(/../g)!
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] > 0.36
    ? "#293e35"
    : "#fafbf7";
}
export function readSettings(search: string): ExplorerSettings {
  const params = new URLSearchParams(search);
  const get = (key: string) => params.get("mi_" + key);
  const settings = { ...defaultSettings };
  settings.query = (get("q") || "").slice(0, 120);
  const category = get("category");
  if (category && ["All Icons", ...categories].includes(category))
    settings.category = category;
  const size = Number(get("size"));
  if (get("size") && Number.isFinite(size))
    settings.size = Math.round(Math.min(96, Math.max(16, size)) / 2) * 2;
  settings.color = normalizeHex(get("color") || "") || settings.color;
  const canvas = get("canvas");
  if (canvas && canvasColors.includes(canvas as (typeof canvasColors)[number]))
    settings.background = canvas;
  const weight = get("weight");
  if (weight && Object.hasOwn(strokeWeights, weight))
    settings.weight = weight as StrokeWeight;
  if (get("density") === "compact") settings.density = "compact";
  const availability = get("availability");
  if (availability === "npm" || availability === "svg")
    settings.availability = availability;
  const sort = get("sort");
  if (sort === "name-asc" || sort === "name-desc") settings.sort = sort;
  return settings;
}
export function shareUrl(settings: ExplorerSettings, origin: string) {
  const url = new URL("/#icons", origin);
  const values = {
    q: settings.query,
    category: settings.category,
    size: String(settings.size),
    color: settings.color,
    canvas: settings.background,
    weight: settings.weight,
    density: settings.density,
    availability: settings.availability,
    sort: settings.sort,
  };
  const defaults = {
    q: defaultSettings.query,
    category: defaultSettings.category,
    size: String(defaultSettings.size),
    color: defaultSettings.color,
    canvas: defaultSettings.background,
    weight: defaultSettings.weight,
    density: defaultSettings.density,
    availability: defaultSettings.availability,
    sort: defaultSettings.sort,
  };
  for (const key of Object.keys(values) as (keyof typeof values)[])
    if (values[key] !== defaults[key])
      url.searchParams.set("mi_" + key, values[key]);
  return url.toString();
}
