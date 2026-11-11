import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { copyText } from "./actions";
import { trackEvent } from "./analytics";
import {
  normalizeHex,
  readableInk,
  shareUrl,
  strokeWeights,
  type ExplorerSettings,
  type StrokeWeight,
} from "./explorer-settings";
function ToolIcon({
  name,
}: {
  name: "reset" | "share" | "random" | "grid" | "canvas" | "search";
}) {
  const paths = {
    reset: (
      <>
        <path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" />
      </>
    ),
    share: (
      <>
        <path
          d="m10 14 4-4M8 16l-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 8l2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"
          transform="translate(2 2) scale(.83)"
        />
      </>
    ),
    random: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path
          d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01"
          strokeWidth="2.5"
        />
      </>
    ),
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    canvas: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M4 12h16M12 4v16" />
        <path d="M4 4h8v8H4zM12 12h8v8h-8z" fill="currentColor" opacity=".25" />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 5 5" />
      </>
    ),
  };
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
export function WeightSelect({
  value,
  onChange,
}: {
  value: StrokeWeight;
  onChange: (weight: StrokeWeight) => void;
}) {
  return (
    <label className="weight-control">
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWeights[value]}
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M5 7h14M5 12h14M5 17h14" />
      </svg>
      <select
        aria-label="Stroke weight"
        value={value}
        onChange={(event) => onChange(event.target.value as StrokeWeight)}
      >
        {Object.keys(strokeWeights).map((weight) => (
          <option value={weight} key={weight}>
            {weight[0].toUpperCase() + weight.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
}
export function ExplorerToolbar({
  settings,
  onChange,
  searchRef,
  onReset,
  onRandom,
  hasResults,
  resetToken,
}: {
  settings: ExplorerSettings;
  onChange: (patch: Partial<ExplorerSettings>) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  onReset: () => void;
  onRandom: () => void;
  hasResults: boolean;
  resetToken: number;
}) {
  const [draft, setDraft] = useState(settings.color);
  const [colorError, setColorError] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [fallback, setFallback] = useState("");
  const messageTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => {
    setDraft(settings.color);
    setColorError("");
  }, [settings.color, resetToken]);
  useEffect(() => {
    setShareMessage("");
    setFallback("");
    clearTimeout(messageTimer.current);
  }, [settings, resetToken]);
  useEffect(() => () => clearTimeout(messageTimer.current), []);
  const commitColor = () => {
    const color = normalizeHex(draft);
    if (color) {
      onChange({ color });
      setDraft(color);
      setColorError("");
    } else {
      setColorError("Enter a 3- or 6-digit hex color.");
    }
  };
  const copyView = async () => {
    const url = shareUrl(settings, window.location.origin);
    try {
      await copyText(url);
      setFallback("");
      setShareMessage("Link copied");
      trackEvent("share_view", {
        icon_category: settings.category,
        weight: settings.weight,
      });
      clearTimeout(messageTimer.current);
      messageTimer.current = setTimeout(() => setShareMessage(""), 2200);
    } catch {
      setFallback(url);
      setShareMessage("Select and copy this link.");
    }
  };
  return (
    <div
      className="explorer-toolbar"
      role="group"
      aria-label="Icon preview toolbar"
    >
      <WeightSelect
        value={settings.weight}
        onChange={(weight) => onChange({ weight })}
      />
      <div className="toolbar-search">
        <ToolIcon name="search" />
        <input
          ref={searchRef}
          aria-label="Search icons"
          placeholder="Search icons"
          maxLength={120}
          value={settings.query}
          onChange={(event) => onChange({ query: event.target.value })}
        />
        {settings.query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              onChange({ query: "" });
              trackEvent("search_clear", { icon_category: settings.category });
              searchRef.current?.focus();
            }}
          >
            ×
          </button>
        ) : (
          <kbd>⌘ / Ctrl K</kbd>
        )}
      </div>
      <label className="toolbar-size">
        <output>
          {settings.size}
          <span>px</span>
        </output>
        <input
          type="range"
          aria-label="Icon size"
          min="16"
          max="96"
          step="2"
          value={settings.size}
          onChange={(event) => onChange({ size: Number(event.target.value) })}
        />
      </label>
      <div
        className="toolbar-color"
        style={{
          background: settings.color,
          color: readableInk(settings.color),
        }}
      >
        <label title="Choose icon color">
          <input
            type="color"
            aria-label="Custom icon color"
            value={settings.color}
            onChange={(event) => {
              onChange({ color: event.target.value });
              setColorError("");
            }}
          />
          <span aria-hidden="true" />
        </label>
        <input
          type="text"
          aria-label="Hex color"
          aria-invalid={Boolean(colorError)}
          spellCheck={false}
          value={draft.toUpperCase()}
          maxLength={7}
          onChange={(event) => {
            setDraft(event.target.value);
            setColorError("");
          }}
          onBlur={commitColor}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitColor();
            }
            if (event.key === "Escape") {
              setDraft(settings.color);
              setColorError("");
            }
          }}
        />
      </div>
      <div className="toolbar-actions">
        <label className="toolbar-canvas" title="Canvas color">
          <ToolIcon name="canvas" />
          <select
            aria-label="Preview background"
            value={settings.background}
            onChange={(event) => onChange({ background: event.target.value })}
          >
            <option value="#ffffff">White</option>
            <option value="#f3f4ee">Warm</option>
            <option value="#202b27">Dark</option>
          </select>
        </label>
        <button
          type="button"
          aria-label="Reset all filters and preview settings"
          title="Reset all filters and preview settings"
          onClick={onReset}
        >
          <ToolIcon name="reset" />
        </button>
        <button
          type="button"
          aria-label="Copy link to current view"
          title="Copy link to current view"
          onClick={copyView}
        >
          <ToolIcon name="share" />
        </button>
        <button
          type="button"
          aria-label="Preview a random icon"
          title="Preview a random icon"
          onClick={onRandom}
          disabled={!hasResults}
        >
          <ToolIcon name="random" />
        </button>
        <button
          type="button"
          aria-label="Toggle compact grid"
          title="Toggle compact grid"
          aria-pressed={settings.density === "compact"}
          onClick={() =>
            onChange({
              density:
                settings.density === "compact" ? "comfortable" : "compact",
            })
          }
        >
          <ToolIcon name="grid" />
        </button>
      </div>
      {(colorError || shareMessage) && (
        <div className="toolbar-notice" role="status">
          {colorError || shareMessage}
        </div>
      )}
      {fallback && (
        <div className="share-fallback">
          <label>
            Current view link
            <input
              aria-label="Current view link"
              readOnly
              value={fallback}
              onFocus={(event) => event.currentTarget.select()}
            />
          </label>
        </div>
      )}
    </div>
  );
}
