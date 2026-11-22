import { LoadingMain, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <LoadingMain className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-16">
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-64 max-w-full rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="size-11 sm:w-32" />
        <Skeleton className="size-11 sm:w-24" />
      </div>
      <Skeleton className="aspect-video w-full max-w-3xl" />
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="ml-auto h-11 w-44" />
        </div>
        <div className="surface divide-y">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-2 px-4 py-3">
              <Skeleton className="h-5 w-48 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </LoadingMain>
  );
}
