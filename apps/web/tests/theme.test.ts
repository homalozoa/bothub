import assert from "node:assert/strict";
import { after, test } from "node:test";
import { runInNewContext } from "node:vm";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
after(() => {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
});

let instance = 0;
async function reader(raw?: string, darkSystem = false) {
  const values = new Map<string, string>(raw === undefined ? [] : [["aihot-theme", raw]]);
  const localStorage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
  const browser = {
    localStorage,
    matchMedia: () => ({ matches: darkSystem }),
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
  // A reopened document must not inherit a previous document's snapshot or volatile preference.
  const state: typeof import("../app/lib/local-state.ts") = await import(`../app/lib/local-state.ts?theme=${instance++}`);
  function boot(storage = localStorage) {
    let appearance = "";
    runInNewContext(state.THEME_BOOT_SCRIPT, {
      localStorage: storage, window: browser,
      document: { documentElement: { setAttribute: (key: string, value: string) => { assert.equal(key, "data-theme"); appearance = value; } } },
    });
    return appearance;
  }
  return { state, values, browser, boot };
}

test("fresh and invalid preferences follow the system, matching first paint", async () => {
  for (const darkSystem of [false, true]) {
    for (const raw of [undefined, "", "broken", "null", '"system"']) {
      const { state, boot } = await reader(raw, darkSystem);
      assert.equal(state.getThemePreference(), null);
      assert.equal(state.resolvedTheme(), darkSystem ? "dark" : "light");
      assert.equal(boot(), darkSystem ? "dark" : "light");
      assert.equal(state.exportBundle().theme, "auto");
    }
  }
});

test("raw and legacy quoted light and dark preferences survive regardless of system theme", async () => {
  for (const pref of ["light", "dark"] as const) {
    for (const raw of [pref, JSON.stringify(pref)]) {
      const { state, boot } = await reader(raw, pref === "light");
      assert.equal(state.getThemePreference(), pref);
      assert.equal(state.resolvedTheme(), pref);
      assert.equal(boot(), pref);
    }
  }
});

test("explicit auto follows both system appearances and stays distinct from an unset preference", async () => {
  for (const darkSystem of [false, true]) {
    for (const raw of ["auto", '"auto"']) {
      const { state, boot } = await reader(raw, darkSystem);
      assert.equal(state.getThemePreference(), null);
      assert.equal(state.resolvedTheme(), darkSystem ? "dark" : "light");
      assert.equal(state.resolvedTheme(null), darkSystem ? "dark" : "light");
      assert.equal(boot(), darkSystem ? "dark" : "light");
      assert.equal(state.exportBundle().theme, "auto");
    }
  }
});

test("the setter saves auto for system and ordinary strings for explicit appearances", async () => {
  const { state, values, boot } = await reader();
  state.setThemePreference("light");
  assert.equal(values.get(state.KEYS.theme), "light");
  assert.equal(state.getThemePreference(), "light");
  state.setThemePreference(null);
  assert.equal(values.get(state.KEYS.theme), "auto");
  assert.equal(state.getThemePreference(), null);
  assert.equal(boot(), "light");
  state.setThemePreference("dark");
  assert.equal(values.get(state.KEYS.theme), "dark");
  assert.equal(state.getThemePreference(), "dark");
});

test("denied storage still follows the system and allows an in-document choice", async () => {
  const { state, browser, boot } = await reader(undefined, true);
  const deniedStorage = { getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("denied"); }, removeItem: () => { throw new Error("denied"); } };
  Object.defineProperty(browser, "localStorage", { configurable: true, get: () => { throw new Error("denied"); } });
  assert.equal(state.getThemePreference(), null);
  assert.equal(state.resolvedTheme(), "dark");
  assert.equal(boot(deniedStorage), "dark");
  state.setThemePreference("light");
  assert.equal(state.getThemePreference(), "light");
  assert.equal(state.resolvedTheme(), "light");
  state.setThemePreference(null);
  assert.equal(state.getThemePreference(), null);
  assert.equal(state.resolvedTheme(), "dark");
  assert.equal(state.exportBundle().theme, "auto");
});

test("a missing system theme API falls back to light in the getter resolution and boot", async () => {
  const { state, browser, boot } = await reader("auto");
  browser.matchMedia = () => { throw new Error("unavailable"); };
  assert.equal(state.resolvedTheme(null), "light");
  assert.equal(boot(), "light");
});

test("version 1 imports apply a preference to fresh or invalid storage, including auto and legacy null", async () => {
  for (const raw of [undefined, "damaged"]) {
    for (const theme of ["light", "dark", "auto", null]) {
      const { state, values } = await reader(raw);
      const report = await state.importBundle(JSON.stringify({ version: 1, starred: [], read: [], theme }));
      assert.equal(report.themeApplied, true);
      assert.equal(values.get(state.KEYS.theme), theme ?? "auto");
      assert.equal(state.getThemePreference(), theme === "auto" || theme === null ? null : theme);
      assert.equal(state.exportBundle().version, 1);
      assert.equal(state.exportBundle().theme, theme ?? "auto");
    }
  }
});

test("imports preserve every explicit saved preference and missing or unsupported incoming themes", async () => {
  for (const saved of ["light", "dark", "auto", '"light"', '"dark"', '"auto"']) {
    const { state, values } = await reader(saved);
    const report = await state.importBundle(JSON.stringify({ version: 1, starred: [], read: [], theme: "light" }));
    assert.equal(report.themeApplied, false);
    assert.equal(values.get(state.KEYS.theme), saved);
  }
  for (const theme of [undefined, "unsupported"]) {
    const { state, values } = await reader();
    const report = await state.importBundle(JSON.stringify({ version: 1, starred: [], read: [], theme }));
    assert.equal(report.themeApplied, false);
    assert.equal(values.has(state.KEYS.theme), false);
    assert.equal(state.getThemePreference(), null);
  }
});
