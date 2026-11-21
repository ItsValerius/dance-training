const UMLAUTS: Record<string, string> = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };

/** "Walzer-Grundschritt für Anfänger!" -> "walzer-grundschritt-fuer-anfaenger" */
export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[äöüß]/g, (c) => UMLAUTS[c])
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "") // strip other accents: é -> e
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
      .replace(/-+$/, "") || "uebung"
  );
}

/** First of base, base-2, base-3, … that isn't in `taken`. */
export function nextFreeSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
