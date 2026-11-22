import { LoadingMain, Skeleton } from "@/components/skeleton";

const SectionHead = () => (
  <div className="flex items-center gap-3">
    <Skeleton className="h-7 w-36 rounded-full" />
    <Skeleton className="ml-auto h-11 w-44" />
  </div>
);

export default function Loading() {
  return (
    <LoadingMain className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-16">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-9 w-48 max-w-full rounded-full" />
          <Skeleton className="h-5 w-56 max-w-full rounded-full" />
        </div>
        <Skeleton className="size-11 sm:w-32" />
        <Skeleton className="size-11 sm:w-24" />
      </div>
      <section className="space-y-3">
        <SectionHead />
        <div className="surface divide-y">
          {[0, 1, 2].map((i) => <div key={i} className="flex min-h-14 items-center px-4"><Skeleton className="h-5 w-48 rounded-full" /></div>)}
        </div>
      </section>
      <section className="space-y-3">
        <SectionHead />
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="h-4 w-full rounded-full" />
        <div className="surface divide-y">
          {[0, 1, 2].map((i) => <div key={i} className="flex min-h-12 items-center px-4"><Skeleton className="h-5 w-32 rounded-full" /></div>)}
        </div>
      </section>
    </LoadingMain>
  );
}
