import { asc, desc, eq } from "drizzle-orm";
import { Check, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmDelete } from "@/components/confirm-delete";
import { CreateDialog } from "@/components/create-dialog";
import { ExerciseFields } from "@/components/exercise-fields";
import { PickList } from "@/components/pick-list";
import { Badge } from "@/components/ui/badge";
import { Video } from "@/components/video";
import { db } from "@/db";
import { category, completion, exercise, exerciseCategory, planExercise, trainingPlan } from "@/db/schema";
import { requireTrainer } from "@/lib/auth";
import { categoryOptions, currentPlanOptions, formatDue, planProgress, today } from "@/lib/queries";
import { addExerciseToPlans, deleteExercise, updateExercise } from "../../actions";

export default async function ExercisePage({ params }: PageProps<"/trainer/uebungen/[slug]">) {
  await requireTrainer();
  const { slug } = await params;
  const ex = await db
    .select({ id: exercise.id, slug: exercise.slug, title: exercise.title, description: exercise.description, youtubeId: exercise.youtubeId })
    .from(exercise)
    .where(eq(exercise.slug, slug))
    .get();
  if (!ex) notFound();
  const cats = await db
    .select({ id: category.id, name: category.name })
    .from(exerciseCategory)
    .innerJoin(category, eq(category.id, exerciseCategory.categoryId))
    .where(eq(exerciseCategory.exerciseId, ex.id))
    .orderBy(asc(category.name));
  const defaults = { ...ex, categoryIds: cats.map((c) => c.id) };
  const [categories, current, plans, done] = await Promise.all([
    categoryOptions(),
    currentPlanOptions(),
    db
      .select({ id: trainingPlan.id, title: trainingPlan.title, dueDate: trainingPlan.dueDate })
      .from(planExercise)
      .innerJoin(trainingPlan, eq(trainingPlan.id, planExercise.planId))
      .where(eq(planExercise.exerciseId, ex.id))
      .orderBy(desc(trainingPlan.dueDate)),
    db.select({ planId: completion.planId, userId: completion.userId }).from(completion).where(eq(completion.exerciseId, ex.id)),
  ]);
  // shortcut: one progress query per plan; fine for a club's handful of plans per exercise
  const reach = await Promise.all(plans.map((p) => planProgress(p.id)));
  const t = today();
  const inPlans = plans.map((p, i) => {
    const doneIds = new Set(done.filter((d) => d.planId === p.id).map((d) => d.userId));
    const people = reach[i].map((r) => ({ id: r.id, name: r.name, done: doneIds.has(r.id) }));
    return { ...p, people, expired: p.dueDate < t };
  });
  const addable = current.filter((o) => !plans.some((p) => p.id === o.value));

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-16">
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight break-words">{ex.title}</h1>
          {cats.map((c) => <Badge key={c.id} variant="secondary">{c.name}</Badge>)}
        </div>
        <div className="flex shrink-0 gap-2">
          <CreateDialog label="Bearbeiten" title="Übung bearbeiten" submitLabel="Speichern" icon={<Pencil aria-hidden />} variant="outline" compact action={updateExercise.bind(null, ex.id, ex.slug)}>
            <ExerciseFields categories={categories} defaults={defaults} />
          </CreateDialog>
          <ConfirmDelete action={deleteExercise.bind(null, ex.id)} title={`„${ex.title}“ löschen?`} description="Verschwindet aus allen Plänen, auch früheren." />
        </div>
      </div>
      <div className="max-w-3xl space-y-3">
        <Video id={ex.youtubeId} title={ex.title} />
        {ex.description && <p className="whitespace-pre-line text-muted-foreground">{ex.description}</p>}
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="min-w-0 flex-1 text-xl font-bold">Pläne</h2>
          <CreateDialog label="Zu Plan hinzufügen" title="Zu Plan hinzufügen" description="Aktuelle Pläne, die die Übung noch nicht haben." submitLabel="Hinzufügen" action={addExerciseToPlans.bind(null, ex.id, ex.slug)}>
            <PickList name="planIds" sections={[{ items: addable }]} searchLabel="Pläne durchsuchen" empty={current.length ? "Schon in allen aktuellen Plänen." : "Gerade kein aktueller Plan."} />
          </CreateDialog>
        </div>
        {inPlans.length === 0 ? (
          <p className="text-muted-foreground">Noch in keinem Plan.</p>
        ) : (
          <ul className="surface divide-y overflow-hidden">
            {inPlans.map((p) => {
              const n = p.people.filter((x) => x.done).length;
              return (
                <li key={p.id} className="space-y-1 px-4 py-3">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <Link href={`/trainer/plaene/${p.id}`} className="font-semibold underline-offset-4 hover:underline">{p.title}</Link>
                    <span className="text-sm text-muted-foreground">{p.expired ? "abgelaufen" : `fällig ${formatDue(p.dueDate)}`}</span>
                    {p.people.length > 0 && (
                      <span className={n === p.people.length ? "ml-auto text-sm font-semibold text-success-ink" : "ml-auto text-sm text-muted-foreground"}>
                        {n}/{p.people.length} erledigt
                      </span>
                    )}
                  </div>
                  {p.people.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Noch niemandem zugewiesen.</p>
                  ) : (
                    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                      {p.people.map((x) => (
                        <li key={x.id} className={x.done ? "flex items-center gap-1 font-semibold text-success-ink" : "text-muted-foreground"}>
                          {x.done && <Check aria-hidden className="size-4 stroke-3" />}
                          {x.name}
                          <span className="sr-only">{x.done ? ", erledigt" : ", offen"}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
