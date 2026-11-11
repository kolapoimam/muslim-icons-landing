import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { defaultSettings, readSettings, shareUrl } from "./explorer-settings";
import { customizeSvg } from "./svg-options";
import { getSvg } from "./IconArt";
import { icons, jsxExample } from "./registry";
afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/");
});
describe("explorer controls and accordion", () => {
  it("allows only one FAQ answer open and lets the active answer collapse", async () => {
    const u = userEvent.setup();
    render(<App />);
    const first = screen.getByRole("button", { name: "What is Muslim Icons?" });
    const second = screen.getByRole("button", {
      name: "Can I download Islamic icons as SVG files?",
    });
    await u.click(first);
    expect(first.getAttribute("aria-expanded")).toBe("true");
    await u.click(second);
    expect(first.getAttribute("aria-expanded")).toBe("false");
    expect(second.getAttribute("aria-expanded")).toBe("true");
    const faq = screen.getByRole("region", {
      name: "Muslim icons, explained.",
    });
    expect(within(faq).getAllByRole("region")).toHaveLength(1);
    await u.keyboard("{Enter}");
    expect(second.getAttribute("aria-expanded")).toBe("false");
    expect(within(faq).queryByRole("region")).toBeNull();
  });
  it("combines category, search and npm availability, sorts the results, and resets every setting", async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.selectOptions(
      screen.getByRole("combobox", { name: "Icon availability" }),
      "svg",
    );
    expect(
      screen.getByRole("status", { name: "Search results" }).textContent,
    ).toContain("9 icons");
    await u.type(
      screen.getByRole("textbox", { name: "Search icons" }),
      "qiyam",
    );
    await u.click(screen.getByRole("button", { name: /Worship & Prayer/ }));
    expect(screen.getByRole("button", { name: "Preview Qiyam" })).toBeTruthy();
    await u.click(screen.getByRole("button", { name: "Clear search" }));
    await u.selectOptions(
      screen.getByRole("combobox", { name: "Sort icons" }),
      "name-desc",
    );
    const names = [...document.querySelectorAll(".icon-grid .icon-name")].map(
      (el) => el.textContent!,
    );
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
    await u.selectOptions(
      screen.getByRole("combobox", { name: "Stroke weight" }),
      "bold",
    );
    fireEvent.change(screen.getByRole("slider", { name: "Icon size" }), {
      target: { value: "64" },
    });
    expect(
      document.querySelector(".icon-card svg")?.getAttribute("stroke-width"),
    ).toBe("3");
    await u.click(screen.getByRole("button", { name: "Toggle compact grid" }));
    await u.click(
      screen.getByRole("button", {
        name: "Reset all filters and preview settings",
      }),
    );
    expect(
      screen.getByRole("status", { name: "Search results" }).textContent,
    ).toContain("104 icons");
    expect(
      (
        screen.getByRole("combobox", {
          name: "Stroke weight",
        }) as HTMLSelectElement
      ).value,
    ).toBe("regular");
    expect(
      (screen.getByRole("slider", { name: "Icon size" }) as HTMLInputElement)
        .value,
    ).toBe("32");
    expect(
      (
        screen.getByRole("combobox", {
          name: "Icon availability",
        }) as HTMLSelectElement
      ).value,
    ).toBe("all");
    expect(
      screen
        .getByRole("button", { name: "Toggle compact grid" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    const colorField = screen.getByRole("textbox", { name: "Hex color" });
    fireEvent.change(colorField, { target: { value: "#zzzzzz" } });
    fireEvent.blur(colorField);
    expect(screen.getByText("Enter a 3- or 6-digit hex color.")).toBeTruthy();
    await u.click(
      screen.getByRole("button", {
        name: "Reset all filters and preview settings",
      }),
    );
    expect((colorField as HTMLInputElement).value).toBe("#293E35");
    expect(screen.queryByText("Enter a 3- or 6-digit hex color.")).toBeNull();
  });
  it("shares a restorable view and supports the keyboard search shortcut", async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.selectOptions(
      screen.getByRole("combobox", { name: "Stroke weight" }),
      "light",
    );
    await u.click(screen.getByRole("button", { name: /Ramadan & Eid/ }));
    const hex = screen.getByRole("textbox", { name: "Hex color" });
    await u.clear(hex);
    await u.type(hex, "#ff6600");
    await u.keyboard("{Enter}");
    fireEvent.change(screen.getByRole("slider", { name: "Icon size" }), {
      target: { value: "48" },
    });
    const copy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    await u.click(
      screen.getByRole("button", { name: "Copy link to current view" }),
    );
    const url = new URL(copy.mock.calls[0][0]);
    expect(url.hash).toBe("#icons");
    expect(readSettings(url.search)).toMatchObject({
      category: "Ramadan & Eid",
      weight: "light",
      size: 48,
      color: "#ff6600",
    });
    await u.keyboard("{Control>}k{/Control}");
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Search icons" }),
    );
  });
  it("restores valid share settings after mounting and offers a manual copy fallback", async () => {
    window.history.replaceState(
      null,
      "",
      "/?mi_q=mosque&mi_weight=bold&mi_size=48&mi_color=%237c3aed#icons",
    );
    const u = userEvent.setup();
    render(<App />);
    expect(
      (
        screen.getByRole("textbox", {
          name: "Search icons",
        }) as HTMLInputElement
      ).value,
    ).toBe("mosque");
    expect(
      document.querySelector(".icon-card svg")?.getAttribute("stroke-width"),
    ).toBe("3");
    expect(
      (screen.getByRole("textbox", { name: "Hex color" }) as HTMLInputElement)
        .value,
    ).toBe("#7C3AED");
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new Error("blocked"),
    );
    await u.click(
      screen.getByRole("button", { name: "Copy link to current view" }),
    );
    expect(
      (
        screen.getByRole("textbox", {
          name: "Current view link",
        }) as HTMLInputElement
      ).value,
    ).toContain("mi_weight=bold");
  });
  it("chooses a random icon from the filtered set and keeps custom weight in React examples", async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.type(
      screen.getByRole("textbox", { name: "Search icons" }),
      "fanous",
    );
    await u.selectOptions(
      screen.getByRole("combobox", { name: "Stroke weight" }),
      "bold",
    );
    await u.click(
      screen.getByRole("button", { name: "Preview a random icon" }),
    );
    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: "Ramadan Lantern" }),
    ).toBeTruthy();
    expect(within(dialog).getByText(/strokeWidth=\{3\}/)).toBeTruthy();
  });
  it("applies pasted hex colors immediately and copies the current hex value", async () => {
    const u = userEvent.setup();
    render(<App />);
    const hex = screen.getByRole("textbox", {
      name: "Hex color",
    }) as HTMLInputElement;
    await u.click(hex);
    await u.paste("ff6600");
    expect(hex.value).toBe("#FF6600");
    expect(
      (document.querySelector(".icon-card") as HTMLElement).style.color,
    ).toBe("rgb(255, 102, 0)");
    await u.paste("#abc");
    expect(hex.value).toBe("#AABBCC");
    await u.paste("color: #16a34a;");
    expect(hex.value).toBe("#16A34A");
    const copy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    await u.click(screen.getByRole("button", { name: "Copy hex color" }));
    expect(copy).toHaveBeenLastCalledWith("#16A34A");
    expect(screen.getByText("Hex code copied")).toBeTruthy();
  });
  it("applies a complete typed hex before blur and selects it if clipboard access fails", async () => {
    const u = userEvent.setup();
    render(<App />);
    const hex = screen.getByRole("textbox", {
      name: "Hex color",
    }) as HTMLInputElement;
    await u.clear(hex);
    await u.type(hex, "abc123");
    expect(document.activeElement).toBe(hex);
    expect(hex.value).toBe("#ABC123");
    expect(
      (document.querySelector(".icon-card") as HTMLElement).style.color,
    ).toBe("rgb(171, 193, 35)");
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new Error("blocked"),
    );
    await u.click(screen.getByRole("button", { name: "Copy hex color" }));
    expect(screen.getByText("Select and copy the hex code.")).toBeTruthy();
    expect(document.activeElement).toBe(hex);
    expect(hex.selectionStart).toBe(0);
    expect(hex.selectionEnd).toBe(7);
  });
  it("validates URL values and emits a single correct SVG stroke attribute without changing paths", () => {
    expect(
      readSettings("?mi_weight=fill&mi_size=9999&mi_color=invalid"),
    ).toMatchObject({
      weight: "regular",
      size: 96,
      color: defaultSettings.color,
    });
    const state = {
      ...defaultSettings,
      query: "quran",
      weight: "thin" as const,
      color: "#ff8800",
      availability: "npm" as const,
    };
    expect(
      readSettings(
        new URL(shareUrl(state, "https://muslimicons.vercel.app")).search,
      ),
    ).toEqual(state);
    const icon = icons[0];
    const original = new DOMParser().parseFromString(
      getSvg(icon),
      "image/svg+xml",
    );
    const source = customizeSvg(getSvg(icon), {
      strokeWidth: 3,
      color: "#123456",
      size: 48,
    });
    const svg = new DOMParser().parseFromString(source, "image/svg+xml");
    expect(svg.querySelector("parsererror")).toBeNull();
    expect(svg.documentElement.getAttribute("stroke-width")).toBe("3");
    expect(svg.documentElement.getAttribute("width")).toBe("48");
    expect(
      [...svg.querySelectorAll("path")].map((p) => p.getAttribute("d")),
    ).toEqual(
      [...original.querySelectorAll("path")].map((p) => p.getAttribute("d")),
    );
    expect(
      jsxExample(icon, 48, { strokeWidth: 3, color: "#123456" }),
    ).toContain('strokeWidth={3} color="#123456"');
  });
});
