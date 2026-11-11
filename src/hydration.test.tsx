import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect, vi } from "vitest";
import App from "./App";
it("hydrates the crawler-readable homepage without recovery errors and preserves search", async () => {
  const container = document.createElement("div");
  container.innerHTML = renderToString(<App />);
  document.body.append(container);
  const onRecoverableError = vi.fn();
  let root!: Root;
  try {
    expect(container.querySelectorAll(".icon-card")).toHaveLength(88);
    await act(async () => {
      root = hydrateRoot(container, <App />, { onRecoverableError });
    });
    await userEvent
      .setup()
      .type(
        within(container).getByRole("textbox", { name: "Search icons" }),
        "fanous",
      );
    expect(
      within(container).getByRole("status", { name: "Search results" })
        .textContent,
    ).toContain("1 icon");
    expect(
      within(container).getByRole("button", {
        name: "Preview Ramadan Lantern",
      }),
    ).toBeTruthy();
    expect(onRecoverableError).not.toHaveBeenCalled();
  } finally {
    if (root) await act(async () => root.unmount());
    container.remove();
  }
});
