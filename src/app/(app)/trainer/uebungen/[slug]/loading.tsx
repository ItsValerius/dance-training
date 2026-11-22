import { LoadingMain, Skeleton } from "@/components/skeleton";

/**
 * Only what every exercise page shows: title, edit/delete, the video and the "Pläne" heading with its button.
 * Category chips, the description and the plan list depend on the exercise.
 */
export default function Loading() {
  return (
    <LoadingMain className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-16">
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-64 max-w-full rounded-full" />
        <Skeleton className="ml-auto size-11 shrink-0 sm:w-32" />
        <Skeleton className="size-11 shrink-0 sm:w-24" />
      </div>
      <Skeleton className="aspect-video w-full max-w-3xl" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="ml-auto h-11 w-44" />
      </div>
    </LoadingMain>
  );
}
