import { LoadingMain, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <LoadingMain className="mx-auto w-full max-w-2xl space-y-6 px-4 pt-6 pb-16">
      <Skeleton className="h-8 w-48 rounded-full" />
      <div className="surface divide-y overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="ml-auto h-5 w-28 rounded-full" />
          </div>
        ))}
      </div>
    </LoadingMain>
  );
}
