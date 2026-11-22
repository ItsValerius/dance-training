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

/** Suspense fallback for a trainer list: toolbar plus table rows, inside a page whose heading is already there. */
export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">Lädt…</span>
      <Skeleton className="h-11 w-full max-w-xs" />
      <div aria-hidden className="surface divide-y overflow-hidden">
        <div className="h-12" />
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex h-14 items-center gap-3 px-4">
            <Skeleton className="h-5 w-40 rounded-full" />
            <Skeleton className="ml-auto h-5 w-28 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
