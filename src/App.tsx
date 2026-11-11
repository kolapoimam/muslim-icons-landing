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
import { IconArt } from "./IconArt";
import { copyText, downloadSvg } from "./actions";
import { config } from "./config";
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
    <a href="#home" className="brand">
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
}: {
  text: string;
  label?: string;
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
          } catch (e) {
            setMessage((e as Error).message);
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
function Code({ title, code }: { title: string; code: string }) {
  return (
    <div className="code">
      <div className="code-top">
        <span>{title}</span>
        <CopyButton text={code} />
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
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"} <span aria-hidden="true">☰</span>
        </button>
        <nav
          aria-label="Main navigation"
          className={open ? "nav open" : "nav"}
          onClick={() => setOpen(false)}
        >
          <a className="nav-active" href="#icons">
            Icons
          </a>
          <a href="#documentation">Documentation</a>
          <a href="#contribute">Contribute</a>
          <a className="github-link" href={repo}>
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
        <div className="eyebrow">
          <span className="status-dot" /> AN OPEN SOURCE COLLECTION, WITH
          PURPOSE
        </div>
        <h1>
          Icons for
          <br />
          the <span>Ummah.</span>
        </h1>
        <p>
          A thoughtful icon library for the things you’re building.
          <br className="desktop-break" /> Made for Muslim communities. Open to
          everyone.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="#icons">
            Explore the icons <span aria-hidden="true">↓</span>
          </a>
          <a className="text-link" href={repo}>
            View on GitHub <Arrow />
          </a>
        </div>
        <div className="hero-meta">
          <span>Free & open source</span>
          <span>SVG + React</span>
          <span>Made with intention</span>
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
        <div className="spec-footer">
          <span>Distinct in meaning. Consistent in form.</span>
          <span aria-hidden="true">✳</span>
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
}: {
  size: number;
  setSize: (v: number) => void;
  color: string;
  setColor: (v: string) => void;
  background: string;
  setBackground: (v: string) => void;
}) {
  return (
    <div className="preview-controls">
      <label className="size-control">
        Size{" "}
        <input
          aria-label="Icon size"
          type="range"
          min="20"
          max="64"
          step="2"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
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
            onClick={() => setColor(c)}
          />
        ))}
        <label className="custom-color" title="Custom icon color">
          <input
            aria-label="Custom icon color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <span aria-hidden="true">+</span>
        </label>
      </div>
      <label className="background-control">
        Canvas{" "}
        <select
          aria-label="Preview background"
          value={background}
          onChange={(e) => setBackground(e.target.value)}
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
}: {
  icon: IconRecord;
  onClose: () => void;
  size: number;
  setSize: (v: number) => void;
  color: string;
  setColor: (v: string) => void;
  background: string;
  setBackground: (v: string) => void;
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
          <IconArt icon={icon} size={size} color={color} />
          <span>
            {size} × {size}
          </span>
        </div>
        <div className="detail-content">
          <span className="pill">
            {icon.status === "placeholder"
              ? "Planned · placeholder"
              : "Repository artwork · draft"}
          </span>
          <h2 id="detail-title">{icon.displayName}</h2>
          <code className="technical-name">{icon.name}</code>
          <p>{icon.description}</p>
          <div className="detail-category">{icon.category}</div>
          <PreviewControls
            {...{ size, setSize, color, setColor, background, setBackground }}
          />
          <div className="tags">
            {[...new Set([...icon.tags, ...icon.aliases])]
              .slice(0, 8)
              .map((t) => (
                <span key={t}>{t}</span>
              ))}
          </div>
          <p className="integration-note">
            {icon.packageComponent
              ? "Matches the existing React export. Package not yet published."
              : "Planned export — this component is not in the current package."}
          </p>
          <Code title="React import" code={importExample(icon)} />
          <Code title="JSX usage" code={jsxExample(icon, size)} />
          <button
            className="button primary download"
            onClick={() => {
              try {
                downloadSvg(icon, color, size);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            Download {icon.status === "placeholder" ? "placeholder" : "draft"}{" "}
            SVG <span aria-hidden="true">↓</span>
          </button>
          {error && <p role="alert">{error}</p>}
          <p className="fine-print">
            Preview artwork. Final designs are in development.
            <br />
            Review the{" "}
            <a href={`${repo}/blob/main/packages/svg/LICENSE`}>
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
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Icons");
  const [size, setSize] = useState(32);
  const [color, setColor] = useState(colors[0]);
  const [background, setBackground] = useState("#ffffff");
  const [density, setDensity] = useState("comfortable");
  const [selected, setSelected] = useState<IconRecord | null>(null);
  const search = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) &&
        !document.querySelector('[role="dialog"]')
      ) {
        e.preventDefault();
        search.current?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  const closeDetail = useCallback(() => setSelected(null), []);
  const filtered = findIcons(query, category);
  const reset = () => {
    setQuery("");
    setCategory("All Icons");
    search.current?.focus();
  };
  return (
    <section className="explorer" id="icons" aria-labelledby="explorer-title">
      <div className="explorer-heading">
        <div>
          <span className="eyebrow">
            SMALL DETAILS. MEANINGFUL POSSIBILITIES.
          </span>
          <h2 id="explorer-title">
            Find your next icon.
            <span className="count-pill">{icons.length} icons</span>
          </h2>
        </div>
        <span className="preview-badge">
          <span className="status-dot" /> Collection preview
        </span>
      </div>
      <div className="search-box">
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="6" />
          <path d="m15 15 5 5" />
        </svg>
        <input
          ref={search}
          aria-label="Search icons"
          placeholder="Search icons... mosque, quran, prayer, ramadan"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query ? (
          <button
            aria-label="Clear search"
            className="icon-button"
            onClick={() => {
              setQuery("");
              search.current?.focus();
            }}
          >
            ×
          </button>
        ) : (
          <kbd>/</kbd>
        )}
      </div>
      <div className="explorer-body">
        <aside className="category-rail">
          <h3>CATEGORIES</h3>
          <div
            className="category-list"
            role="group"
            aria-label="Filter by category"
          >
            {["All Icons", ...categories].map((c, i) => (
              <button
                key={c}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
                className={category === c ? "category active" : "category"}
              >
                <span className="category-symbol" aria-hidden="true">
                  {["⊞", "⌂", "◇", "▤", "✧", "⬡", "◈", "♧", "✳"][i]}
                </span>
                <span>{c}</span>
                <span className="category-count">
                  {c === "All Icons"
                    ? icons.length
                    : icons.filter((icon) => icon.category === c).length}
                </span>
              </button>
            ))}
          </div>
          <div className="rail-note">
            <span aria-hidden="true">↳</span>
            <p>
              A growing collection.
              <br />A shared purpose.
            </p>
            <a href={`${repo}/issues`}>
              Suggest an icon <Arrow />
            </a>
          </div>
        </aside>
        <div className="results">
          <div className="results-toolbar">
            <PreviewControls
              {...{ size, setSize, color, setColor, background, setBackground }}
            />
            <button
              className="density"
              aria-label="Toggle compact grid"
              aria-pressed={density === "compact"}
              onClick={() =>
                setDensity(density === "compact" ? "comfortable" : "compact")
              }
            >
              ▦
            </button>
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
            <span>
              Click an icon to make it yours <span aria-hidden="true">↗</span>
            </span>
          </div>
          {filtered.length ? (
            <div
              className={`icon-grid ${density}`}
              style={
                { "--canvas": background } as import("react").CSSProperties
              }
            >
              {filtered.map((icon) => (
                <button
                  className="icon-card"
                  aria-label={`Preview ${icon.displayName}`}
                  key={icon.name}
                  onClick={() => setSelected(icon)}
                  style={{ color }}
                >
                  <span className="card-arrow" aria-hidden="true">
                    ↗
                  </span>
                  <IconArt icon={icon} size={size} />
                  <span className="icon-name">{icon.displayName}</span>
                  <span className="art-status">
                    {icon.status === "placeholder" ? "placeholder" : "draft"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span aria-hidden="true">⌕</span>
              <h3>No icons found.</h3>
              <p>
                Try another name, an alias like “tasbih”, or a different
                category.
              </p>
              <button className="button secondary" onClick={reset}>
                Reset search & filters
              </button>
            </div>
          )}
          <div className="collection-note">
            <span aria-hidden="true">ⓘ</span> A work in progress, thoughtfully.
            Includes{" "}
            {icons.filter((i) => i.status === "repository-draft").length}{" "}
            repository drafts and{" "}
            {icons.filter((i) => i.status === "placeholder").length} temporary
            placeholders. Final artwork is being refined.
          </div>
        </div>
      </div>
      {selected && (
        <DetailPanel
          icon={selected}
          onClose={closeDetail}
          {...{ size, setSize, color, setColor, background, setBackground }}
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
  return (
    <>
      <section className="purpose">
        <div className="section-intro">
          <span className="eyebrow">A LITTLE MORE REPRESENTATION.</span>
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
          <span className="eyebrow">LESS SETUP. MORE BUILDING.</span>
          <h2>
            From icon
            <br />
            to interface.
          </h2>
          <p>
            A familiar React API. Size, color and standard SVG props. No extra
            moving parts.
          </p>
          <span className="pill">React package · preparing v0.1.0</span>
          <p className="fine-print">
            Installation is an upcoming example. The package has not been
            published to npm.
          </p>
          <a
            className="text-link"
            href={`${repo}/blob/main/packages/react/README.md`}
          >
            Read the documentation <Arrow />
          </a>
        </div>
        <div className="integration-code">
          <Code
            title="01 / Install after the first release"
            code={`npm install ${config.packageName}`}
          />
          <Code
            title="02 / Make it part of your interface"
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
      <section className="contribution" id="contribute">
        <div>
          <span className="eyebrow">GOOD THINGS ARE BUILT TOGETHER.</span>
          <h2>Help shape the collection.</h2>
          <p>
            Design an icon. Improve the code. Share an idea.
            <br />
            There’s a place for your contribution.
          </p>
        </div>
        <div>
          <a className="button primary" href={repo}>
            Contribute on GitHub <Arrow />
          </a>
          <a className="text-link" href={`${repo}/blob/main/CONTRIBUTING.md`}>
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
        <div>
          <Brand />
          <p>Made for developers building for the Ummah.</p>
        </div>
        <nav aria-label="Footer">
          <a href="#icons">Icons</a>
          <a href="#documentation">Documentation</a>
          <a href={repo}>
            GitHub <Arrow />
          </a>
          <a href="#contribute">Contribute</a>
          <a href={`${repo}/blob/main/LICENSE`}>Licence</a>
        </nav>
      </div>
      <div className="footer-credit">
        <span>Powered by</span>{" "}
        <a href="https://hdfund.org">
          Human Development Fund <Arrow />
        </a>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Muslim Icons</span>
        <span>Code: MIT · Artwork: review licensing notes</span>
        <span>
          One icon at a time.{" "}
          <span className="tiny-mark" aria-hidden="true">
            ✳
          </span>
        </span>
      </div>
    </footer>
  );
}
export default function App() {
  return (
    <>
      <a className="skip-link" href="#icons">
        Skip to icon explorer
      </a>
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
