import { LoadingMain, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <LoadingMain className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-16">
      <Skeleton className="h-9 w-44 rounded-full" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-full max-w-xs" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="surface divide-y overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex min-h-14 items-center gap-3 px-4 py-2.5">
            <Skeleton className="h-6 w-36 rounded-full" />
            <Skeleton className="ml-auto h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </LoadingMain>
  );
}
