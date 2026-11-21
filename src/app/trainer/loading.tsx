import { LoadingMain, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <LoadingMain className="mx-auto grid w-full max-w-5xl gap-8 px-4 pt-6 pb-16 md:grid-cols-[1fr_22rem]">
      <section className="space-y-4">
        <Skeleton className="h-9 w-40 rounded-full" />
        <div className="surface divide-y overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <Skeleton className="h-6 w-40 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="ml-auto h-5 w-28 rounded-full" />
            </div>
          ))}
        </div>
      </section>
      <div className="surface h-fit space-y-4 p-5">
        <Skeleton className="h-6 w-32 rounded-full" />
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        <Skeleton className="h-10 w-full" />
      </div>
    </LoadingMain>
  );
}
