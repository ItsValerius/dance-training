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

/**
 * Suspense fallback for a trainer table. Only what every state shows: the toolbar (search + filter) and the
 * table with its header and one row (real data or the "Noch keine …" line); further rows simply appear.
 */
export function TableSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">Lädt…</span>
      <div aria-hidden className="flex gap-2 sm:gap-4">
        <Skeleton className="h-11 min-w-0 flex-1 sm:max-w-xs" />
        <Skeleton className="h-11 w-36 shrink-0" />
      </div>
      <div aria-hidden className="surface divide-y overflow-hidden">
        <div className="h-12" />
        <div className="flex h-14 items-center px-4">
          <Skeleton className="h-5 w-40 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** One line of text: for spots that hold either a list or a single "Noch keine …" sentence. */
export function LineSkeleton({ className }: { className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn("flex h-6 items-center", className)}>
      <span className="sr-only">Lädt…</span>
      <Skeleton className="h-4 w-48 rounded-full" />
    </div>
  );
}
