"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

const links = [
  { href: "/trainer", label: "Übungen" },
  { href: "/trainer/schueler", label: "Schüler" },
  { href: "/trainer/gruppen", label: "Gruppen" },
  { href: "/trainer/kategorien", label: "Kategorien" },
];

export function NavLinks() {
  const path = usePathname();
  return (
    <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 sm:pb-0">
      {links.map((l) => {
        // "Übungen" also owns the exercise detail pages
        const active = l.href === "/trainer" ? path === "/trainer" || path.startsWith("/trainer/uebungen") : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors",
              active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}
