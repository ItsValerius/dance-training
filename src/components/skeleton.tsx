import type { ComponentProps } from "react";
import { cn } from "cn";

/** Placeholder block. Shape via className (rounded-lg controls, rounded-full text/pills). */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div aria-hidden className={cn("animate-pulse rounded-lg bg-muted motion-reduce:animate-none", className)} {...props} />
  );
}

/** Live-region wrapper: announces "Lädt…" once; children are the aria-hidden shapes. */
export function LoadingMain({ className, children }: ComponentProps<"main">) {
  return (
    <main role="status" aria-live="polite" className={className}>
      <span className="sr-only">Lädt…</span>
      {children}
    </main>
  );
}
