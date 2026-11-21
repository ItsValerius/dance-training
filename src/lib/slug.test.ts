import assert from "node:assert/strict";
import { test } from "node:test";
import { nextFreeSlug, slugify } from "./slug.ts";

test("slugify", () => {
  assert.equal(slugify("Walzer-Grundschritt für Anfänger!"), "walzer-grundschritt-fuer-anfaenger");
  assert.equal(slugify("  Größe & Übung  "), "groesse-uebung");
  assert.equal(slugify("Pas de bourrée"), "pas-de-bourree");
  assert.equal(slugify("!!!"), "uebung");
  assert.ok(slugify("a".repeat(200)).length <= 80);
  assert.ok(!slugify("ab ".repeat(40)).endsWith("-"));
});

test("nextFreeSlug", () => {
  assert.equal(nextFreeSlug("walzer", new Set()), "walzer");
  assert.equal(nextFreeSlug("walzer", new Set(["walzer"])), "walzer-2");
  assert.equal(nextFreeSlug("walzer", new Set(["walzer", "walzer-2", "walzer-3"])), "walzer-4");
});
