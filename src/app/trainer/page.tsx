import { asc, count, eq } from "drizzle-orm";
import { CreateDialog } from "@/components/create-dialog";
import { ExerciseFields } from "@/components/exercise-fields";
import { ExercisesTable } from "@/components/exercises-table";
import { PlanPickerField } from "@/components/plan-picker-field";
import { db } from "@/db";
import { exercise, planExercise } from "@/db/schema";
import { requireTrainer } from "@/lib/auth";
import { categoriesByExercise, categoryOptions, currentPlanOptions } from "@/lib/queries";
import { createExercise } from "./actions";

export default async function TrainerExercises() {
  await requireTrainer();
  const [exercises, categories, cats, plans] = await Promise.all([
    db
      .select({ id: exercise.id, slug: exercise.slug, title: exercise.title, plans: count(planExercise.planId) })
      .from(exercise)
      .leftJoin(planExercise, eq(planExercise.exerciseId, exercise.id))
      .groupBy(exercise.id)
      .orderBy(asc(exercise.title)),
    categoryOptions(),
    categoriesByExercise(),
    currentPlanOptions(),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-4 px-4 pt-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Übungen</h1>
        <CreateDialog label="Neue Übung" title="Neue Übung" description="Der nächste fällige Plan ist schon gewählt." action={createExercise}>
          <ExerciseFields categories={categories} />
          <PlanPickerField plans={plans} defaultValue={plans.slice(0, 1).map((p) => p.value)} />
        </CreateDialog>
      </div>
      <ExercisesTable exercises={exercises.map((e) => ({ ...e, categories: cats.get(e.id)?.map((c) => c.name) ?? [] }))} categories={categories.map((c) => c.label)} />
    </main>
  );
}
