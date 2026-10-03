import assert from "node:assert/strict";
import { test } from "node:test";
import { TABBAR, tabIsActive } from "../app/components/shell/nav.ts";

test("public mobile routes highlight exactly one matching navigation entry", () => {
  const routes = [
    ["/", "/"], ["/all", "/all"], ["/daily/2026-10-03", "/daily"],
    ["/weekly", "/daily"], ["/monthly", "/daily"],
    ["/channels", "/channels"], ["/channels/biology", "/channels"],
    ["/channels/agents", "/channels"], ["/topics/natural-history", "/more"],
    ["/hot", "/more"], ["/feedback", "/more"], ["/more", "/more"],
  ];
  for (const [path, expected] of routes) {
    assert.deepEqual(TABBAR.filter(item => tabIsActive(item, path!)).map(item => item.to), [expected], path);
  }
});
