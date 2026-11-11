import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  categories,
  findIcons,
  icons,
  importExample,
  jsxExample,
  type IconRecord,
} from "./registry";
import { IconArt, getSvg } from "./IconArt";
import { copyText, downloadSvg } from "./actions";
import { config } from "./config";
import { faqs } from "./content";
import { ExplorerToolbar, WeightSelect } from "./ExplorerToolbar";
import {
  defaultSettings,
  readSettings,
  readableInk,
  strokeWeights,
  type ExplorerSettings,
  type StrokeWeight,
  type Availability,
  type SortOrder,
} from "./explorer-settings";
import { customizeSvg } from "./svg-options";
import {
  initAnalytics,
  trackEvent,
  trackDebouncedEvent,
  searchParameters,
} from "./analytics";
const repo = config.repositoryUrl;
function Mark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
function Brand() {
  return (
    <a target="_blank" rel="noopener noreferrer" href="#home" className="brand">
      <Mark />
      muslim<span>icons</span>
    </a>
  );
}
function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
function CopyButton({
  text,
  label = "Copy",
  format = "code",
  iconName,
}: {
  text: string;
  label?: string;
  format?: string;
  iconName?: string;
}) {
  const [message, setMessage] = useState("");
  return (
    <>
      <button
        className="copy-button"
        onClick={async () => {
          try {
            await copyText(text);
            setMessage("Copied");
            trackEvent("copy_code", {
              code_format: format,
              icon_name: iconName,
            });
          } catch (e) {
            setMessage((e as Error).message);
            trackEvent("copy_code_failed", {
              code_format: format,
              icon_name: iconName,
              failure_reason: "clipboard_unavailable",
            });
          }
        }}
      >
        {message === "Copied" ? "✓ Copied" : label}
      </button>
      {message && message !== "Copied" && (
        <span role="status" className="copy-error">
          {message}
        </span>
      )}
    </>
  );
}
function Code({
  title,
  code,
  format = "code",
  iconName,
}: {
  title: string;
  code: string;
  format?: string;
  iconName?: string;
}) {
  return (
    <div className="code">
      <div className="code-top">
        <span>{title}</span>
        <CopyButton text={code} format={format} iconName={iconName} />
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="header-inner">
        <Brand />
        <button
          className="menu-button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => {
            setOpen(!open);
            trackEvent("navigation_menu_toggle", {
              menu_state: open ? "closed" : "open",
            });
          }}
        >
          {open ? "Close" : "Menu"} <span aria-hidden="true">☰</span>
        </button>
        <nav
          aria-label="Main navigation"
          className={open ? "nav open" : "nav"}
          onClick={() => setOpen(false)}
        >
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="nav-active"
            href="#icons"
          >
            Icons
          </a>
          <a target="_blank" rel="noopener noreferrer" href="#documentation">
            Documentation
          </a>
          <a target="_blank" rel="noopener noreferrer" href="#contribute">
            Contribute
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
            href={repo}
          >
            GitHub <Arrow />
          </a>
        </nav>
      </div>
    </header>
  );
}
function Hero() {
  const feature = [
    "mosque",
    "quran-open",
    "kaaba",
    "prayer-mat",
    "ramadan-lantern",
    "prayer-beads",
    "hijab",
    "eid-gift",
    "qibla",
  ];
  return (
    <section className="hero" id="home">
      <div className="hero-copy">
        <h1>
          Icons for
          <br />
          the <span>Ummah.</span>
        </h1>
        <p>Muslim and Islamic icons for apps, websites and design systems.</p>
        <div className="hero-actions">
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="button primary"
            href="#icons"
          >
            Explore the icons <span aria-hidden="true">↓</span>
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="text-link npm-cta"
            href={config.packageUrl}
          >
            Get the React package <Arrow />
          </a>
        </div>
      </div>
      <div
        className="hero-display"
        aria-label="A preview of the icon collection"
      >
        <div className="spec-label">
          THE COLLECTION <span>01 — {icons.length}</span>
        </div>
        <div className="hero-icons">
          {feature.map((name) => (
            <div key={name}>
              <IconArt icon={icons.find((i) => i.name === name)!} size={43} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
const colors = ["#293e35", "#246b55", "#7271a6", "#b66a47"];
function PreviewControls({
  size,
  setSize,
  color,
  setColor,
  background,
  setBackground,
  context = "grid",
  iconName,
  weight,
  setWeight,
}: {
  size: number;
  setSize: (v: number) => void;
  color: string;
  setColor: (v: string) => void;
  background: string;
  setBackground: (v: string) => void;
  context?: "grid" | "detail";
  iconName?: string;
  weight?: StrokeWeight;
  setWeight?: (value: StrokeWeight) => void;
}) {
  return (
    <div className="preview-controls">
      {weight && setWeight && (
        <WeightSelect
          value={weight}
          onChange={(value) => {
            setWeight(value);
            trackEvent("preview_change", {
              control: "weight",
              stroke_weight: value,
              context,
              icon_name: iconName,
            });
          }}
        />
      )}
      <label className="size-control">
        Size{" "}
        <input
          aria-label="Icon size"
          type="range"
          min="16"
          max="96"
          step="2"
          value={size}
          onChange={(e) => {
            const value = Number(e.target.value);
            setSize(value);
            trackDebouncedEvent(`size_${context}`, "preview_change", {
              control: "size",
              icon_size: value,
              context,
              icon_name: iconName,
            });
          }}
        />
        <output>
          {size}
          <small>px</small>
        </output>
      </label>
      <div className="control-divider" />
      <div className="color-controls">
        <span>Color</span>
        {colors.map((c) => (
          <button
            key={c}
            aria-label={`Preview color ${c}`}
            aria-pressed={color === c}
            className="swatch"
            style={{ background: c }}
            onClick={() => {
              setColor(c);
              trackEvent("preview_change", {
                control: "color",
                icon_color: c,
                context,
                icon_name: iconName,
              });
            }}
          />
        ))}
        <label className="custom-color" title="Custom icon color">
          <input
            aria-label="Custom icon color"
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              trackDebouncedEvent(`color_${context}`, "preview_change", {
                control: "color",
                icon_color: e.target.value,
                context,
                icon_name: iconName,
              });
            }}
          />
          <span aria-hidden="true">+</span>
        </label>
      </div>
      <label className="background-control">
        Canvas{" "}
        <select
          aria-label="Preview background"
          value={background}
          onChange={(e) => {
            setBackground(e.target.value);
            trackEvent("preview_change", {
              control: "background",
              canvas_color: e.target.value,
              context,
              icon_name: iconName,
            });
          }}
        >
          <option value="#ffffff">White</option>
          <option value="#f3f4ee">Warm</option>
          <option value="#202b27">Dark</option>
        </select>
      </label>
    </div>
  );
}
function DetailPanel({
  icon,
  onClose,
  size,
  setSize,
  color,
  setColor,
  background,
  setBackground,
  weight,
  setWeight,
}: {
  icon: IconRecord;
  onClose: () => void;
  size: number;
  setSize: (v: number) => void;
  color: string;
  setColor: (v: string) => void;
  background: string;
  setBackground: (v: string) => void;
  weight: StrokeWeight;
  setWeight: (value: StrokeWeight) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const items = ref.current?.querySelectorAll<HTMLElement>(
          'button,a,input,select,[tabindex="0"]',
        );
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="detail-panel"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="detail-top">
          <span>ICON DETAILS</span>
          <button
            ref={closeRef}
            className="icon-button"
            aria-label="Close icon details"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="detail-preview" style={{ background }}>
          <IconArt
            icon={icon}
            size={size}
            color={color}
            strokeWidth={strokeWeights[weight]}
          />
          <span>
            {size} × {size}
          </span>
        </div>
        <div className="detail-content">
          <h2 id="detail-title">{icon.displayName}</h2>
          <code className="technical-name">{icon.name}</code>
          <p>{icon.description}</p>
          <div className="detail-category">{icon.category}</div>
          <PreviewControls
            weight={weight}
            setWeight={setWeight}
            context="detail"
            iconName={icon.name}
            {...{ size, setSize, color, setColor, background, setBackground }}
          />
          <div className="tags">
            {[...new Set([...icon.tags, ...icon.aliases])]
              .slice(0, 8)
              .map((t) => (
                <span key={t}>{t}</span>
              ))}
          </div>
          {icon.availableInPackage ? (
            <>
              <Code
                title="React import"
                code={importExample(icon)}
                format="react_import"
                iconName={icon.name}
              />
              <Code
                title="JSX usage"
                code={jsxExample(icon, size, {
                  strokeWidth: strokeWeights[weight],
                  color,
                })}
                format="jsx"
                iconName={icon.name}
              />
            </>
          ) : (
            <Code
              title="SVG markup"
              code={customizeSvg(getSvg(icon), {
                size,
                color,
                strokeWidth: strokeWeights[weight],
              })}
              format="svg"
              iconName={icon.name}
            />
          )}
          <button
            className="button primary download"
            onClick={() => {
              try {
                downloadSvg(icon, color, size, strokeWeights[weight]);
              } catch (e) {
                setError((e as Error).message);
                trackEvent("download_svg_failed", { icon_name: icon.name });
              }
            }}
          >
            Download SVG <span aria-hidden="true">↓</span>
          </button>
          {error && <p role="alert">{error}</p>}
          <p className="fine-print">
            Review the{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`${repo}/blob/main/packages/svg/LICENSE`}
            >
              artwork licensing notes
            </a>{" "}
            before production use.
          </p>
        </div>
      </div>
    </div>
  );
}
function Explorer() {
  const [settings, setSettings] = useState<ExplorerSettings>(() => ({
    ...defaultSettings,
  }));
  const {
    query,
    category,
    size,
    color,
    background,
    density,
    weight,
    availability,
    sort,
  } = settings;
  const [selected, setSelected] = useState<IconRecord | null>(null);
  const [resetToken, setResetToken] = useState(0);
  const search = useRef<HTMLInputElement>(null);
  const openedAt = useRef(0);
  useEffect(() => {
    const restore = () => setSettings(readSettings(window.location.search));
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing =
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
        target.isContentEditable;
      const shortcut =
        (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !typing);
      if (shortcut && !document.querySelector('[role="dialog"]')) {
        event.preventDefault();
        search.current?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  const change = (patch: Partial<ExplorerSettings>) => {
    const next = { ...settings, ...patch };
    if (patch.background && [defaultSettings.color, "#fafbf7"].includes(color))
      next.color = readableInk(patch.background);
    setSettings(next);
    if (patch.category && patch.category !== category)
      trackEvent("category_filter", {
        icon_category: next.category,
        icon_count: findIcons("", next.category).length,
      });
    if (patch.availability && patch.availability !== availability)
      trackEvent("availability_filter", { availability: next.availability });
    if (patch.sort && patch.sort !== sort)
      trackEvent("sort_change", { sort_order: next.sort });
    if (patch.density && patch.density !== density)
      trackEvent("grid_density_change", { density: next.density });
    for (const control of ["size", "color", "background", "weight"] as const) {
      if (patch[control] !== undefined && patch[control] !== settings[control])
        trackDebouncedEvent(`toolbar_${control}`, "preview_change", {
          control,
          context: "grid",
          icon_size: next.size,
          icon_color: next.color,
          canvas_color: next.background,
          stroke_weight: next.weight,
        });
    }
  };
  const openIcon = (icon: IconRecord, source = "grid") => {
    openedAt.current = Date.now();
    setSelected(icon);
    trackEvent("icon_preview", {
      icon_name: icon.name,
      icon_category: icon.category,
      available_in_package: icon.availableInPackage,
      source,
    });
  };
  const closeDetail = useCallback(() => {
    if (selected)
      trackEvent("icon_preview_close", {
        icon_name: selected.name,
        view_duration_ms: Math.max(0, Date.now() - openedAt.current),
      });
    setSelected(null);
  }, [selected]);
  const availableIcons = icons.filter(
    (icon) =>
      availability === "all" ||
      (availability === "npm"
        ? icon.availableInPackage
        : !icon.availableInPackage),
  );
  const filtered = findIcons(query, category).filter((icon) =>
    availableIcons.includes(icon),
  );
  if (sort !== "collection")
    filtered.sort(
      (a, b) =>
        (sort === "name-asc" ? 1 : -1) *
        a.displayName.localeCompare(b.displayName),
    );
  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(
      () =>
        trackEvent("search", {
          ...searchParameters(query, category, filtered.length),
          availability,
        }),
      600,
    );
    return () => clearTimeout(timer);
  }, [query, category, availability, filtered.length]);
  const reset = () => {
    trackEvent("filters_reset", { icon_category: category });
    setSettings({ ...defaultSettings });
    setResetToken((current) => current + 1);
    const url = new URL(window.location.href);
    for (const key of [...url.searchParams.keys()])
      if (key.startsWith("mi_")) url.searchParams.delete(key);
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    search.current?.focus();
  };
  const setSize = (value: number) =>
    setSettings((current) => ({ ...current, size: value }));
  const setColor = (value: string) =>
    setSettings((current) => ({ ...current, color: value }));
  const setBackground = (value: string) =>
    setSettings((current) => ({
      ...current,
      background: value,
      color: [defaultSettings.color, "#fafbf7"].includes(current.color)
        ? readableInk(value)
        : current.color,
    }));
  const setWeight = (value: StrokeWeight) =>
    setSettings((current) => ({ ...current, weight: value }));
  return (
    <section className="explorer" id="icons" aria-labelledby="explorer-title">
      <div className="explorer-heading">
        <h2 id="explorer-title">
          Explore the icons.
          <span className="count-pill">{icons.length} icons</span>
        </h2>
        <span className="library-format">24 × 24 / SVG + React</span>
      </div>
      <ExplorerToolbar
        settings={settings}
        onChange={change}
        searchRef={search}
        onReset={reset}
        onRandom={() => {
          if (filtered.length)
            openIcon(
              filtered[Math.floor(Math.random() * filtered.length)],
              "random",
            );
        }}
        hasResults={filtered.length > 0}
        resetToken={resetToken}
      />
      <div className="explorer-filter-row">
        <div
          className="category-list"
          role="group"
          aria-label="Filter by category"
        >
          {["All Icons", ...categories].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              className={category === c ? "category active" : "category"}
              onClick={() => change({ category: c })}
            >
              <span>{c}</span>
              <span className="category-count">
                {c === "All Icons"
                  ? availableIcons.length
                  : availableIcons.filter((icon) => icon.category === c).length}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="results-meta">
        <span role="status" aria-label="Search results">
          {filtered.length} {filtered.length === 1 ? "icon" : "icons"}
          {query
            ? ` matching “${query}”`
            : category === "All Icons"
              ? " in the collection"
              : ` in ${category}`}
        </span>
        <div className="results-options">
          <label>
            Availability
            <select
              aria-label="Icon availability"
              value={availability}
              onChange={(event) =>
                change({ availability: event.target.value as Availability })
              }
            >
              <option value="all">All icons</option>
              <option value="npm">React on npm</option>
              <option value="svg">SVG source only</option>
            </select>
          </label>
          <label>
            Sort
            <select
              aria-label="Sort icons"
              value={sort}
              onChange={(event) =>
                change({ sort: event.target.value as SortOrder })
              }
            >
              <option value="collection">Collection order</option>
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
            </select>
          </label>
        </div>
      </div>
      {filtered.length ? (
        <div
          className={`icon-grid ${density}`}
          style={
            {
              "--canvas": background,
              "--preview-size": `${size}px`,
            } as import("react").CSSProperties
          }
        >
          {filtered.map((icon) => (
            <button
              className="icon-card"
              aria-label={`Preview ${icon.displayName}`}
              key={icon.name}
              onClick={() => openIcon(icon)}
              style={{ color }}
            >
              <span className="card-arrow" aria-hidden="true">
                ↗
              </span>
              <IconArt
                icon={icon}
                size={size}
                strokeWidth={strokeWeights[weight]}
              />
              <span className="icon-name">{icon.displayName}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">⌕</span>
          <h3>No icons found.</h3>
          <p>
            Try another name, an alias like “tasbih”, or a different category.
          </p>
          <button className="button secondary" onClick={reset}>
            Reset search & filters
          </button>
        </div>
      )}
      {selected && (
        <DetailPanel
          icon={selected}
          onClose={closeDetail}
          {...{
            size,
            setSize,
            color,
            setColor,
            background,
            setBackground,
            weight,
            setWeight,
          }}
        />
      )}
    </section>
  );
}
function Feature({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="feature">
      <span>{n}</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}
function BelowExplorer() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <>
      <section className="purpose">
        <div className="section-intro">
          <h2>
            Built for the people
            <br />
            building for the Ummah.
          </h2>
          <p>
            Finding the right icon shouldn’t get in the way of a meaningful
            idea. We’re bringing relevant, consistent assets together in one
            open-source collection.
          </p>
        </div>
        <div className="features">
          <Feature n="01" title="Purpose-built">
            From prayer and pilgrimage to everyday life. Familiar concepts,
            thoughtfully represented.
          </Feature>
          <Feature n="02" title="Developer-friendly">
            Original SVGs, a typed React API, and the freedom to build things
            your way.
          </Feature>
          <Feature n="03" title="Consistent by design">
            A shared visual language, made to feel at home in your interface.
          </Feature>
          <Feature n="04" title="Open to everyone">
            Free to explore, improve and contribute to. Better when we build
            together.
          </Feature>
        </div>
      </section>
      <section className="integration" id="documentation">
        <div>
          <h2>
            From icon
            <br />
            to interface.
          </h2>
          <p>
            A familiar React API. Size, color and standard SVG props. No extra
            moving parts.
          </p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="button primary package-cta"
            href={config.packageUrl}
          >
            View package on npm <Arrow />
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
            href={`${repo}/blob/main/packages/react/README.md`}
          >
            Read the documentation <Arrow />
          </a>
        </div>
        <div className="integration-code">
          <Code
            title="01 / Install the React package"
            format="install"
            code={`npm install ${config.packageName}`}
          />
          <Code
            title="02 / Make it part of your interface"
            format="react_example"
            code={
              'import { Mosque, Quran, PrayerMat }\n  from "@muslim-icons/react";\n\n<Mosque size={24} />\n<Quran size={32} color="#246b55" />\n<PrayerMat size={24} />'
            }
          />
          <div className="compatibility">
            <span>React 18 / 19</span>
            <span>TypeScript</span>
            <span>SVG</span>
            <span>Next.js & Vite compatible API</span>
          </div>
        </div>
      </section>
      <section className="faq" id="faq" aria-labelledby="faq-heading">
        <div className="section-intro">
          <h2 id="faq-heading">Muslim icons, explained.</h2>
          <p>Package usage, SVG downloads and licensing.</p>
        </div>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div className="faq-item" key={faq.question}>
              <h3>
                <button
                  type="button"
                  className="faq-question"
                  id={`faq-question-${index}`}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => {
                    const next = openFaq === index ? null : index;
                    setOpenFaq(next);
                    if (next !== null)
                      trackEvent("faq_open", { question: faq.question });
                  }}
                >
                  {faq.question}
                  <span aria-hidden="true">+</span>
                </button>
              </h3>
              <div
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
                hidden={openFaq !== index}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="contribution" id="contribute">
        <div>
          <h2>Help shape the collection.</h2>
          <p>
            Design an icon. Improve the code. Share an idea.
            <br />
            There’s a place for your contribution.
          </p>
        </div>
        <div>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="button primary"
            href={repo}
          >
            Contribute on GitHub <Arrow />
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
            href={`${repo}/blob/main/CONTRIBUTING.md`}
          >
            View contribution guidelines <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </>
  );
}
function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div className="footer-brand">
          <Brand />
          <p>Made for developers building for the Ummah.</p>
        </div>
        <div className="footer-credit">
          <span>Powered by</span>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://hdfund.org"
          >
            Ihsan Labs <Arrow />
          </a>
        </div>
        <nav aria-label="Footer">
          <a target="_blank" rel="noopener noreferrer" href="#icons">
            Icons
          </a>
          <a target="_blank" rel="noopener noreferrer" href="#documentation">
            Documentation
          </a>
          <a target="_blank" rel="noopener noreferrer" href={repo}>
            GitHub <Arrow />
          </a>
          <a target="_blank" rel="noopener noreferrer" href="#contribute">
            Contribute
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`${repo}/blob/main/LICENSE`}
          >
            Licence
          </a>
        </nav>
      </div>
    </footer>
  );
}
export default function App() {
  useEffect(() => initAnalytics(), []);
  return (
    <>
      <button
        className="skip-link"
        type="button"
        onClick={() => {
          document.getElementById("icons")?.scrollIntoView();
          document
            .querySelector<HTMLInputElement>('input[aria-label="Search icons"]')
            ?.focus({ preventScroll: true });
        }}
      >
        Skip to icon explorer
      </button>
      <Navbar />
      <main>
        <Hero />
        <Explorer />
        <BelowExplorer />
      </main>
      <Footer />
    </>
  );
}
