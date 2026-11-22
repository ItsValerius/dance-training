import { LoadingMain, Skeleton } from "@/components/skeleton";

// heading plus its button ("Übungen hinzufügen" is wider than "Zuweisen")
const SectionHead = ({ button }: { button: string }) => (
  <div className="flex items-center gap-3">
    <Skeleton className="h-7 w-36 rounded-full" />
    <Skeleton className={`ml-auto h-11 ${button}`} />
  </div>
);

/**
 * Only what every plan page shows: title, due date, edit/delete, the two section headings with their buttons,
 * the "Für …" line and "Erreicht". Exercise rows, the progress bar and the student list depend on the plan.
 */
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
      <section>
        <SectionHead button="w-44" />
      </section>
      <section className="space-y-3">
        <SectionHead button="w-32" />
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="h-4 w-28 rounded-full" />
      </section>
    </LoadingMain>
  );
}
