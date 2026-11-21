import assert from "node:assert/strict";
import { test } from "node:test";
import { hashToken, newToken } from "./tokens.ts";

test("tokens are unique, url-safe and hash deterministically", () => {
  const a = newToken(), b = newToken();
  assert.notEqual(a, b);
  assert.match(a, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(hashToken(a), hashToken(a));
  assert.notEqual(hashToken(a), a);
});
