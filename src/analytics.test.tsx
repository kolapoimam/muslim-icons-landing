import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import App from "./App";
import {
  analyticsConfig,
  initAnalytics,
  searchParameters,
  trackDebouncedEvent,
  trackEvent,
} from "./analytics";
import { downloadSvg } from "./actions";
import { icons } from "./registry";
let stop = () => {};
function events(name?: string) {
  return (window.dataLayer || [])
    .map((item) => Array.from(item as ArrayLike<unknown>))
    .filter((item) => item[0] === "event" && (!name || item[1] === name)) as [
    string,
    string,
    Record<string, unknown>,
  ][];
}
beforeEach(() => {
  window.dataLayer = [];
  delete window.gtag;
});
afterEach(() => {
  cleanup();
  stop();
  stop = () => {};
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete window.gtag;
  window.dataLayer = [];
});
describe("Google Analytics integration", () => {
  it("initializes the provided GTM container before loading its async script", () => {
    const html = readFileSync("index.html", "utf8");
    const init = html.match(/<script>([\s\S]*?)<\/script>/)![1];
    const page = { dataLayer: [] as unknown[], gtag: undefined as unknown };
    new Function("window", init)(page);
    expect(page.dataLayer).toEqual(
      expect.arrayContaining([expect.objectContaining({ event: "gtm.js" })]),
    );
    expect(typeof page.gtag).toBe("function");
    expect(html.match(/gtm\.js\?id=GTM-NGWM555W/g)).toHaveLength(1);
    expect(html).toContain("ns.html?id=GTM-NGWM555W");
    expect(html.indexOf('event: "gtm.js"')).toBeLessThan(
      html.indexOf("gtm.js?id="),
    );
  });
  it("preserves an existing data layer and routes events to the connected GA4 destination", () => {
    const original = { event: "existing" };
    window.dataLayer = [original];
    trackEvent("icon_preview", { icon_name: "mosque" });
    expect(window.dataLayer[0]).toBe(original);
    expect(events("icon_preview")[0][2]).toMatchObject({
      send_to: analyticsConfig.measurementId,
      icon_name: "mosque",
    });
    window.gtag = () => {
      throw Error("blocked");
    };
    expect(() => trackEvent("icon_preview")).not.toThrow();
  });
  it("debounces continuous controls and excludes contact details from search events", () => {
    vi.useFakeTimers();
    trackDebouncedEvent("size", "preview_change", { icon_size: 24 });
    trackDebouncedEvent("size", "preview_change", { icon_size: 48 });
    vi.advanceTimersByTime(500);
    expect(events("preview_change")).toHaveLength(1);
    expect(events("preview_change")[0][2].icon_size).toBe(48);
    expect(
      searchParameters("person@example.com", "All Icons", 0).search_term,
    ).toBeUndefined();
    expect(
      searchParameters("https://example.com", "All Icons", 0).search_term,
    ).toBeUndefined();
    expect(searchParameters("prayer mat", "All Icons", 1).search_term).toBe(
      "prayer mat",
    );
  });
  it("tracks links once, removes query strings, cleans up listeners and avoids manual page views", () => {
    const link = document.createElement("a");
    link.href =
      "https://www.npmjs.com/package/@muslim-icons/react?private=value";
    link.textContent = "Get the React package";
    link.target = "_blank";
    document.body.append(link);
    const click = () => {
      const e = new MouseEvent("click", { bubbles: true, cancelable: true });
      e.preventDefault();
      link.dispatchEvent(e);
    };
    stop = initAnalytics();
    const secondStop = initAnalytics();
    click();
    expect(events("cta_click")).toHaveLength(1);
    expect(events("cta_click")[0][2]).toMatchObject({
      link_type: "npm",
      new_tab: true,
      link_url: "https://www.npmjs.com/package/@muslim-icons/react",
    });
    expect(events("page_view")).toHaveLength(0);
    expect(events("library_ready")).toHaveLength(1);
    secondStop();
    stop();
    click();
    expect(events("cta_click")).toHaveLength(1);
    link.remove();
  });
  it("sends one search event after typing pauses, with the final result count", () => {
    vi.useFakeTimers();
    render(<App />);
    const input = screen.getByRole("textbox", { name: "Search icons" });
    fireEvent.change(input, { target: { value: "m" } });
    fireEvent.change(input, { target: { value: "mos" } });
    fireEvent.change(input, { target: { value: "mosque" } });
    act(() => vi.advanceTimersByTime(600));
    expect(events("search")).toHaveLength(1);
    expect(events("search")[0][2]).toMatchObject({
      search_term: "mosque",
      icon_category: "All Icons",
    });
    expect(Number(events("search")[0][2].result_count)).toBeGreaterThan(0);
  });
  it("tracks icon preview and successful/failed copying without recording clipboard contents", async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole("button", { name: "Preview Mosque" }));
    expect(events("icon_preview")[0][2].icon_name).toBe("mosque");
    const dialog = screen.getByRole("dialog");
    await u.click(within(dialog).getAllByRole("button", { name: "Copy" })[0]);
    expect(events("copy_code")[0][2]).toMatchObject({
      code_format: "react_import",
      icon_name: "mosque",
    });
    expect(JSON.stringify(events("copy_code"))).not.toContain("import {");
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new Error("blocked"),
    );
    await u.click(within(dialog).getAllByRole("button", { name: "Copy" })[0]);
    expect(events("copy_code_failed")[0][2].code_format).toBe("jsx");
  });
  it("records an SVG download after creating it and does not record its file contents", () => {
    const OriginalURL = URL;
    vi.stubGlobal(
      "URL",
      class extends OriginalURL {
        static createObjectURL() {
          return "blob:download";
        }
        static revokeObjectURL() {}
      },
    );
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    downloadSvg(icons[0], "#293e35", 32);
    expect(events("download_svg")).toHaveLength(1);
    expect(events("download_svg")[0][2]).toMatchObject({
      icon_name: icons[0].name,
      icon_size: 32,
      icon_color: "#293e35",
    });
    expect(JSON.stringify(events("download_svg"))).not.toContain("<svg");
  });
  it("records section visibility once instead of on every observer callback", () => {
    let callback!: IntersectionObserverCallback;
    const unobserve = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: IntersectionObserverCallback) {
          callback = cb;
        }
        observe() {}
        unobserve = unobserve;
        disconnect() {}
      },
    );
    const section = document.createElement("section");
    section.id = "analytics-test";
    section.innerHTML = "<h2>Analytics test</h2>";
    document.body.append(section);
    stop = initAnalytics();
    const entry: IntersectionObserverEntry = {
      target: section.querySelector("h2")!,
      isIntersecting: true,
      intersectionRatio: 1,
      boundingClientRect: section.getBoundingClientRect(),
      intersectionRect: section.getBoundingClientRect(),
      rootBounds: null,
      time: performance.now(),
    };
    callback([entry], {} as IntersectionObserver);
    callback([entry], {} as IntersectionObserver);
    expect(events("section_view")).toHaveLength(1);
    expect(unobserve).toHaveBeenCalledOnce();
    section.remove();
  });
});
