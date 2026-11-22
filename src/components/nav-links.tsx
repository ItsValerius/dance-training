"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// `also`: other path prefixes the tab owns; links without it match their own prefix, "/" only itself
const linksFor = {
  trainer: [
    { href: "/trainer/plaene", label: "Pläne" },
    { href: "/trainer", label: "Übungen", also: "/trainer/uebungen" },
    { href: "/trainer/schueler", label: "Schüler" },
    { href: "/trainer/kategorien", label: "Kategorien" },
  ],
  student: [
    { href: "/", label: "Aktuelle Pläne" },
    { href: "/verlauf", label: "Frühere Pläne" },
  ],
} satisfies Record<string, { href: string; label: string; also?: string }[]>;

/** Section tabs from `sm` up, a menu sheet on phones (with `account`: name, theme, sign out). */
export function NavLinks({ role, account }: { role: keyof typeof linksFor; account: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const links: { href: string; label: string; also?: string }[] = linksFor[role];
  const isActive = (l: (typeof links)[number]) =>
    l.href === "/" || l.href === "/trainer" ? path === l.href || (!!l.also && path.startsWith(l.also)) : path.startsWith(l.href);
  const items = (className: (active: boolean) => string) =>
    links.map((l) => (
      <Link key={l.href} href={l.href} onClick={() => setOpen(false)} aria-current={isActive(l) ? "page" : undefined} className={className(isActive(l))}>
        {l.label}
      </Link>
    ));

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Menü öffnen" className="-mr-2 sm:hidden" />}>
          <Menu aria-hidden className="size-6" />
        </SheetTrigger>
        <SheetContent side="right" className="w-72 p-4">
          <SheetHeader className="p-0 pt-1">
            <SheetTitle className="text-lg font-extrabold tracking-tight text-primary">Tanztraining</SheetTitle>
          </SheetHeader>
          <nav aria-label="Bereiche" className="grid gap-1">
            {items((active) =>
              cn("flex min-h-12 items-center rounded-xl px-4 text-base font-semibold transition-colors", active ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"),
            )}
          </nav>
          <SheetFooter className="mt-auto flex-row items-center gap-1 border-t p-0 pt-3">{account}</SheetFooter>
        </SheetContent>
      </Sheet>
      <div className="flex gap-1 max-sm:hidden">
        {items((active) =>
          cn(
            "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors",
            active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
          ),
        )}
      </div>
    </>
  );
}
