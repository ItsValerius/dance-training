import { LoadingMain, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <LoadingMain className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-16">
      <Skeleton className="h-9 w-40 rounded-full" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-full max-w-xs" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="surface space-y-4 p-5">
            <Skeleton className="h-6 w-40 rounded-full" />
            {[0, 1, 2].map((j) => <Skeleton key={j} className="h-6 w-3/5 rounded-full" />)}
            <Skeleton className="h-10 w-40" />
          </div>
        ))}
      </div>
    </LoadingMain>
  );
}
