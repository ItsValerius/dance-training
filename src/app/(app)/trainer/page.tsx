import { asc, count, eq } from "drizzle-orm";
import { Suspense } from "react";
import { CreateDialog } from "@/components/create-dialog";
import { ExercisesTable } from "@/components/exercises-table";
import { NewExerciseFields } from "@/components/new-exercise-fields";
import { Skeleton, TableSkeleton } from "@/components/skeleton";
import { db } from "@/db";
import { exercise, planExercise } from "@/db/schema";
import { requireTrainer } from "@/lib/auth";
import { categoriesByExercise, categoryOptions, currentPlanOptions } from "@/lib/queries";
import { createExercise } from "./actions";

export default function TrainerExercises() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Übungen</h1>
        <CreateDialog label="Neue Übung" title="Neue Übung" action={createExercise}>
          {/* only the dialog's pickers wait for data, once it is open */}
          <Suspense fallback={<FieldsSkeleton />}>
            <NewExerciseFields data={fieldOptions()} />
          </Suspense>
        </CreateDialog>
      </div>
      {/* only the data waits; heading and button are in the static shell */}
      <Suspense fallback={<TableSkeleton />}>
        <Exercises />
      </Suspense>
    </main>
  );
}

/** Not awaited by the page: the dialog unwraps it when opened. */
async function fieldOptions() {
  await requireTrainer();
  const [categories, plans] = await Promise.all([categoryOptions(), currentPlanOptions()]);
  return { categories, plans };
}

// the create form always has these five fields; the description is a taller textarea
const FieldsSkeleton = () => (
  <div className="grid gap-3">
    {["h-11", "h-11", "h-11", "h-24", "h-11"].map((h, i) => (
      <div key={i} className="grid gap-1.5">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className={h} />
      </div>
    ))}
  </div>
);

async function Exercises() {
  await requireTrainer();
  const [exercises, categories, cats] = await Promise.all([
    db
      .select({ id: exercise.id, slug: exercise.slug, title: exercise.title, plans: count(planExercise.planId) })
      .from(exercise)
      .leftJoin(planExercise, eq(planExercise.exerciseId, exercise.id))
      .groupBy(exercise.id)
      .orderBy(asc(exercise.title)),
    categoryOptions(),
    categoriesByExercise(),
  ]);
  return <ExercisesTable exercises={exercises.map((e) => ({ ...e, categories: cats.get(e.id)?.map((c) => c.name) ?? [] }))} categories={categories.map((c) => c.label)} />;
}
