import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { readFileSync } from "node:fs";
import published from "../vendor/muslim-icons/npm-exports.json";
import {
  icons,
  categories,
  findIcons,
  importExample,
  jsxExample,
} from "./registry";
import { getSvg } from "./IconArt";
import { downloadSvg } from "./actions";
afterEach(() => vi.restoreAllMocks());
describe("registry and asset pipeline", () => {
  it("covers all 104 canonical library icons in 8 categories with original local SVGs", () => {
    expect(icons).toHaveLength(104);
    expect(categories).toHaveLength(8);
    expect(new Set(icons.map((x) => x.name)).size).toBe(104);
    for (const icon of icons) {
      expect(getSvg(icon)).toContain("<svg");
      expect(getSvg(icon)).toContain("</svg>");
      expect(
        new DOMParser()
          .parseFromString(getSvg(icon), "image/svg+xml")
          .querySelector("parsererror"),
      ).toBeNull();
      expect(icon.description).toBeTruthy();
    }
    expect(icons.filter((x) => x.packageComponent)).toHaveLength(104);
  });
  it("matches every canonical SVG and only offers npm imports for published exports", () => {
    for (const icon of icons) {
      const canonical = readFileSync(
        `vendor/muslim-icons/packages/svg/icons/${icon.packageSlug}.svg`,
        "utf8",
      );
      expect(getSvg(icon)).toBe(canonical);
      expect(icon.availableInPackage).toBe(
        published.icons.includes(icon.packageComponent),
      );
    }
    expect(icons.filter((icon) => icon.availableInPackage)).toHaveLength(95);
  });
  it.each([
    ["tasbih", "prayer-beads"],
    ["fanous", "ramadan-lantern"],
    ["salah", "prayer-mat"],
    ["kaaba", "kaaba"],
    ["koran", "quran"],
  ])("resolves %s to %s", (query, name) => {
    expect(findIcons(query).map((x) => x.name)).toContain(name);
  });
  it("combines queries and categories, normalizes separators, searches descriptions and tags", () => {
    expect(findIcons("prayer mat")[0].name).toBe("prayer-mat");
    expect(findIcons("prayer-mat")[0].name).toBe("prayer-mat");
    expect(findIcons("fanous", "Worship & Prayer")).toHaveLength(0);
    expect(findIcons("traditional lantern").length).toBeGreaterThan(0);
    expect(findIcons("no-such-icon")).toHaveLength(0);
  });
  it("matches the canonical React export convention", () => {
    const icon = icons.find((x) => x.name === "quran-open")!;
    expect(importExample(icon)).toContain("OpenQuran");
    expect(jsxExample(icon, 32)).toBe("<OpenQuran size={32} />");
  });
});
describe("explorer interactions", () => {
  it("searches live, clears results, combines category filters, and resets an empty state", async () => {
    const u = userEvent.setup();
    render(<App />);
    const input = screen.getByRole("textbox", { name: "Search icons" });
    await u.type(input, "fanous");
    expect(
      screen.getByRole("button", { name: "Preview Ramadan Lantern" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("status", { name: "Search results" }).textContent,
    ).toContain("1 icon");
    await u.click(screen.getByRole("button", { name: /Worship & Prayer/ }));
    expect(screen.getByText("No icons found.")).toBeTruthy();
    await u.click(
      screen.getByRole("button", { name: "Reset search & filters" }),
    );
    expect(
      screen.getByRole("status", { name: "Search results" }).textContent,
    ).toContain("104 icons");
    await u.type(input, "tasbih");
    await u.click(screen.getByRole("button", { name: "Clear search" }));
    expect((input as HTMLInputElement).value).toBe("");
  });
  it("opens details, copies canonical import and JSX, previews size and color, traps focus and restores it with Escape", async () => {
    const u = userEvent.setup();
    render(<App />);
    const card = screen.getByRole("button", { name: "Preview Quran Open" });
    await u.click(card);
    const dialog = screen.getByRole("dialog");
    const close = within(dialog).getByRole("button", {
      name: "Close icon details",
    });
    expect(document.activeElement).toBe(close);
    expect(
      within(dialog).getByRole("heading", { name: "Quran Open" }),
    ).toBeTruthy();
    const copy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    const buttons = within(dialog).getAllByRole("button", { name: "Copy" });
    await u.click(buttons[0]);
    expect(copy).toHaveBeenLastCalledWith(
      'import { OpenQuran } from "@muslim-icons/react";',
    );
    fireEvent.change(
      within(dialog).getByRole("slider", { name: "Icon size" }),
      { target: { value: "48" } },
    );
    await u.click(buttons[1]);
    expect(copy).toHaveBeenLastCalledWith("<OpenQuran size={48} />");
    await u.click(
      within(dialog).getByRole("button", { name: "Preview color #7271a6" }),
    );
    expect(dialog.querySelector(".icon-art")?.getAttribute("style")).toContain(
      "rgb(114, 113, 166)",
    );
    await u.selectOptions(
      within(dialog).getByRole("combobox", { name: "Preview background" }),
      "#202b27",
    );
    expect(
      dialog.querySelector(".detail-preview")?.getAttribute("style"),
    ).toContain("rgb(32, 43, 39)");
    close.focus();
    await u.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement).toBe(
      within(dialog).getByRole("link", { name: "artwork licensing notes" }),
    );
    await u.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(card);
  });
  it("keeps newer source icons available as SVG without offering an unavailable npm import", async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole("button", { name: "Preview Qiyam" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("SVG markup")).toBeTruthy();
    expect(within(dialog).queryByText("React import")).toBeNull();
    expect(dialog.textContent).not.toContain("Planned export");
    expect(
      within(dialog).getByRole("button", { name: /Download SVG/ }),
    ).toBeTruthy();
  });
  it("reports clipboard rejection with a manual copy fallback", async () => {
    const u = userEvent.setup();
    render(<App />);
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new Error("Select and copy the code manually."),
    );
    await u.click(screen.getAllByRole("button", { name: "Copy" })[0]);
    expect(
      screen.getByRole("status", { name: "Search results" }).textContent,
    ).toContain("104 icons");
    expect(screen.getByText("Select and copy the code manually.")).toBeTruthy();
  });
  it("opens mobile navigation and supports the search shortcut and grid density control", async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole("button", { name: "Toggle navigation" }));
    expect(
      screen
        .getByRole("button", { name: "Toggle navigation" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
    await u.click(
      within(
        screen.getByRole("navigation", { name: "Main navigation" }),
      ).getByRole("link", { name: "Icons" }),
    );
    expect(
      screen
        .getByRole("button", { name: "Toggle navigation" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
    await u.keyboard("/");
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Search icons" }),
    );
    await u.click(screen.getByRole("button", { name: "Toggle compact grid" }));
    expect(document.querySelector(".icon-grid.compact")).toBeTruthy();
  });
  it("generates a local SVG download with selected dimensions and color", async () => {
    const create = vi.fn((_blob: Blob) => "blob:test");
    const revoke = vi.fn();
    vi.stubGlobal(
      "URL",
      Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }),
    );
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    downloadSvg(icons[0], "#246b55", 48);
    expect(create).toHaveBeenCalledOnce();
    expect(create.mock.calls[0][0]).toBeInstanceOf(Blob);
    const blob = create.mock.calls[0][0];
    const contents = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(blob);
    });
    const xml = new DOMParser().parseFromString(contents, "image/svg+xml");
    expect(xml.querySelector("parsererror")).toBeNull();
    expect(xml.documentElement.getAttribute("width")).toBe("48");
    expect(xml.documentElement.getAttribute("height")).toBe("48");
    expect(contents).toContain("#246b55");
    expect(click).toHaveBeenCalledOnce();
    expect(document.querySelector("a[download]")).toBeNull();
  });
});
