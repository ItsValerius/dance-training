import { LoadingMain, Skeleton } from "@/components/skeleton";

// Text placeholders sit inside a box of the real line height, so nothing shifts when content arrives.
const Line = ({ h, w }: { h: string; w: string }) => (
  <div className={`flex items-center ${h}`}>
    <Skeleton className={`h-[60%] rounded-md ${w}`} />
  </div>
);

/**
 * Only what every student sees, whatever their state: the greeting, a plan title and one card (progress,
 * "Alles geschafft!" or the empty state). Exercise cards are left out: an all-done student has none.
 */
export default function Loading() {
  return (
    <LoadingMain className="mx-auto w-full max-w-2xl space-y-8 px-4 pt-6 pb-16">
      <Line h="h-9" w="w-40" />
      <div className="space-y-4">
        <div className="space-y-1">
          <Line h="h-8" w="w-32" />
          <Line h="h-6" w="w-64 max-w-full" />
        </div>
        <div className="surface space-y-3 p-5">
          <Line h="h-10" w="w-40" />
          <Skeleton className="h-4 w-full rounded-full" />
        </div>
      </div>
    </LoadingMain>
  );
}
