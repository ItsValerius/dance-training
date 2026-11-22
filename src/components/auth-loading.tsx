import { LoadingMain, Skeleton } from "@/components/skeleton";

/** Loading state matching AuthShell (invite, password pages). */
export function AuthLoading() {
  return (
    <LoadingMain className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
      <Skeleton className="h-8 w-40 rounded-full" />
      <div className="surface grid w-full max-w-sm gap-4 p-5">
        <Skeleton className="h-7 w-36 rounded-full" />
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
        <Skeleton className="h-12" />
      </div>
    </LoadingMain>
  );
}
