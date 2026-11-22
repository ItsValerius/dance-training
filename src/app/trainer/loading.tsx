import { LoadingMain, Skeleton } from "@/components/skeleton";

/** Shared by the trainer list pages: title + create button, toolbar, rows. */
export default function Loading() {
  return (
    <LoadingMain className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-16">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-44 rounded-full" />
        <Skeleton className="h-11 w-36" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-11 w-full max-w-xs" />
        <div className="surface divide-y overflow-hidden">
          <div className="h-12" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex min-h-14 items-center gap-3 px-4 py-3">
              <Skeleton className="h-5 w-40 rounded-full" />
              <Skeleton className="ml-auto h-5 w-28 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </LoadingMain>
  );
}
