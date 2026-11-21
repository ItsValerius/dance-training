import { LoadingMain, Skeleton } from "@/components/skeleton";

// Text placeholders sit inside a box of the real line height, so nothing shifts when content arrives.
const Line = ({ h, w }: { h: string; w: string }) => (
  <div className={`flex items-center ${h}`}>
    <Skeleton className={`h-[60%] rounded-md ${w}`} />
  </div>
);

/** Mirrors the student home: greeting, progress card, one category with an open card and a finished row. */
export default function Loading() {
  return (
    <LoadingMain className="mx-auto w-full max-w-2xl space-y-8 px-4 pt-6 pb-16">
      <div className="space-y-1">
        <Line h="h-8" w="w-36" />
        <Line h="h-6" w="w-64 max-w-full" />
      </div>
      <div className="surface space-y-3 p-5">
        <Line h="h-10" w="w-40" />
        <Skeleton className="h-4 w-full rounded-full" />
      </div>
      <section className="space-y-3">
        <Line h="h-7" w="w-32" />
        <div className="surface flex flex-col overflow-hidden">
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Line h="h-7" w="w-3/4" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
        <Skeleton className="h-14 w-full rounded-[calc(var(--radius)*1.4)]" />
      </section>
    </LoadingMain>
  );
}
