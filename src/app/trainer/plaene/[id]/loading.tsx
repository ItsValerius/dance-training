import { LoadingMain, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <LoadingMain className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-16">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-64 max-w-full rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="surface space-y-4 p-5">
        <Skeleton className="h-7 w-32 rounded-full" />
        <Skeleton className="h-4 w-full rounded-full" />
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
        <Skeleton className="aspect-video w-full" />
        <div className="surface h-fit space-y-4 p-5">
          <Skeleton className="h-6 w-32 rounded-full" />
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <section className="space-y-3">
        <Skeleton className="h-7 w-36 rounded-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </section>
    </LoadingMain>
  );
}
