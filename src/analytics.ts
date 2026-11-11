import { config } from "./config";
import { icons } from "./registry";

export const analyticsConfig = {
  containerId: "GTM-NGWM555W",
  measurementId: "G-93BBGVF37L",
};
type Value = string | number | boolean | undefined;
export type EventParameters = Record<string, Value>;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
const timers = new Map<string, ReturnType<typeof setTimeout>>();
let activeCleanup: (() => void) | undefined;
let readySent = false;
const seenSections = new Set<string>();

export function trackEvent(name: string, parameters: EventParameters = {}) {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer!.push(arguments);
      };
    const values = Object.fromEntries(
      Object.entries(parameters).filter(([, value]) => value !== undefined),
    );
    window.gtag("event", name, {
      ...values,
      send_to: analyticsConfig.measurementId,
      app_name: "Muslim Icons",
      transport_type: "beacon",
      ...(new URLSearchParams(window.location.search).get("analytics_debug") ===
      "1"
        ? { debug_mode: true }
        : {}),
    });
  } catch {
    // Analytics must never interrupt the explorer, clipboard or downloads.
  }
}

export function trackDebouncedEvent(
  key: string,
  name: string,
  parameters: EventParameters,
  delay = 500,
) {
  if (typeof window === "undefined") return;
  clearTimeout(timers.get(key));
  timers.set(
    key,
    setTimeout(() => {
      timers.delete(key);
      trackEvent(name, parameters);
    }, delay),
  );
}

export function searchParameters(
  query: string,
  category: string,
  resultCount: number,
): EventParameters {
  const term = query.trim().replace(/\s+/g, " ").slice(0, 80);
  const looksPersonal = /@|https?:|www\.|\d[\d\s()+-]{5,}\d/i.test(term);
  return {
    search_term: looksPersonal ? undefined : term,
    query_length: Math.min(query.trim().length, 1000),
    icon_category: category,
    result_count: resultCount,
  };
}

function trackLink(event: MouseEvent) {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest<HTMLAnchorElement>("a[href]");
  if (!link || link.hasAttribute("download")) return;
  let destination: URL;
  try {
    destination = new URL(link.href, window.location.href);
  } catch {
    return;
  }
  if (!["http:", "https:"].includes(destination.protocol)) return;
  let type = "external";
  if (
    destination.hostname === "npmjs.com" ||
    destination.hostname.endsWith(".npmjs.com")
  )
    type = "npm";
  else if (/\/LICENSE$/i.test(destination.pathname)) type = "licence";
  else if (
    /CONTRIBUTING|\/issues/.test(destination.pathname) ||
    destination.hash === "#contribute"
  )
    type = "contribute";
  else if (
    destination.hash === "#documentation" ||
    /README\.md/.test(destination.pathname)
  )
    type = "documentation";
  else if (destination.hostname === "github.com") type = "github";
  else if (destination.hostname === "hdfund.org") type = "attribution";
  else if (destination.origin === window.location.origin) type = "navigation";
  const section = link.closest("section");
  const placement = link.closest("header")
    ? "header"
    : link.closest("footer")
      ? "footer"
      : section?.id || "page";
  trackEvent("cta_click", {
    link_type: type,
    link_text: link.textContent?.replace(/\s+/g, " ").trim().slice(0, 80),
    link_url: destination.origin + destination.pathname + destination.hash,
    placement,
    new_tab: link.target === "_blank",
  });
}

export function initAnalytics() {
  if (typeof window === "undefined" || activeCleanup) return () => {};
  document.addEventListener("click", trackLink);
  let observer: IntersectionObserver | undefined;
  if (typeof IntersectionObserver !== "undefined") {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.closest("section")?.id;
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= 0.5 &&
            id &&
            !seenSections.has(id)
          ) {
            seenSections.add(id);
            trackEvent("section_view", { section_id: id });
            observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.5 },
    );
    document.querySelectorAll("section[id]").forEach((section) => {
      const heading = section.querySelector("h1,h2");
      if (heading) observer?.observe(heading);
    });
  }
  if (!readySent) {
    readySent = true;
    trackEvent("library_ready", {
      icon_count: icons.length,
      package_version: config.packageVersion,
    });
  }
  const cleanup = () => {
    document.removeEventListener("click", trackLink);
    observer?.disconnect();
    for (const timer of timers.values()) clearTimeout(timer);
    timers.clear();
    if (activeCleanup === cleanup) activeCleanup = undefined;
  };
  activeCleanup = cleanup;
  return cleanup;
}
