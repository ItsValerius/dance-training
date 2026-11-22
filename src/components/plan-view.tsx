import { ViewTransition } from "react";
import { CelebrateDisc } from "@/components/celebrate-disc";
import { ExerciseList } from "@/components/exercise-list";
import { ProgressBar } from "@/components/progress-bar";
import { ProgressToast } from "@/components/progress-toast";
import { formatDue, planExercisesForStudent } from "@/lib/queries";

/** One training plan as the student works through it: progress card, exercises by category, toast. */
export async function PlanView({ userId, plan }: { userId: string; plan: { id: string; title: string; dueDate: string } }) {
  const exercises = await planExercisesForStudent(userId, plan.id);
  const groups = [...Map.groupBy(exercises, (e) => e.category ?? "Weitere Übungen")].map(([category, items]) => ({
    category,
    items: items.map((e) => ({ id: e.id, title: e.title, description: e.description, youtubeId: e.youtubeId, done: !!e.completedAt })),
  }));
  const done = exercises.filter((e) => e.completedAt).length;
  const open = exercises.length - done;
  const trainers = [...new Set(exercises.map((e) => e.trainer).filter((t): t is string => !!t))];
  const chosenBy = trainers.length === 0 ? "deinem Trainer" : new Intl.ListFormat("de", { type: "conjunction" }).format(trainers);
  const next = groups.flatMap((g) => g.items).find((e) => !e.done);

  return (
    <>
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold tracking-tight">{plan.title}</h2>
        <p className="text-muted-foreground">
          Bis {formatDue(plan.dueDate)}
          {exercises.length > 0 && ` · ausgesucht von ${chosenBy}`}
        </p>
      </div>

      {exercises.length === 0 ? (
        <p className="text-muted-foreground">Dieser Plan hat noch keine Übungen.</p>
      ) : open === 0 ? (
        <ViewTransition name={`progress-card-${plan.id}`} share="celebrate" default="none">
          <section aria-label="Fortschritt" className="surface flex items-center gap-4 border-success/40 bg-success-soft p-5">
            <CelebrateDisc />
            <div className="space-y-1">
              <p className="text-2xl font-extrabold tracking-tight text-success-ink">Alles geschafft!</p>
              <p className="text-pretty text-success-ink">Alle {exercises.length} Übungen erledigt.</p>
            </div>
          </section>
        </ViewTransition>
      ) : (
        <ViewTransition name={`progress-card-${plan.id}`} share="progress-swap" default="none">
          <section aria-label="Fortschritt" className="surface space-y-3 p-5">
            <p className="text-lg font-bold">
              <span className="text-4xl font-extrabold tracking-tight">{done}</span>
              <span className="text-muted-foreground"> von {exercises.length}</span> erledigt
            </p>
            <ProgressBar done={done} total={exercises.length} />
          </section>
        </ViewTransition>
      )}

      <ExerciseList planId={plan.id} groups={groups} />
      <ProgressToast done={done} total={exercises.length} nextId={next && `${plan.id}-${next.id}`} />
    </>
  );
}
