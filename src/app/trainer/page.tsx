import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { ActionForm } from "@/components/action-form";
import { ExerciseFields } from "@/components/exercise-fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { assignment, category, completion, exercise } from "@/db/schema";
import { requireTrainer } from "@/lib/auth";
import { categoryOptions } from "@/lib/queries";
import { createExercise } from "./actions";

export default async function TrainerExercises() {
  await requireTrainer();
  const [exercises, categories, doneRows] = await Promise.all([
    db
      .select({ id: exercise.id, slug: exercise.slug, title: exercise.title, category: category.name, assigned: count(assignment.id) })
      .from(exercise)
      .innerJoin(category, eq(category.id, exercise.categoryId))
      .leftJoin(assignment, eq(assignment.exerciseId, exercise.id))
      .groupBy(exercise.id)
      .orderBy(asc(category.name), asc(exercise.title)),
    categoryOptions(),
    db.select({ exerciseId: completion.exerciseId, n: count() }).from(completion).groupBy(completion.exerciseId),
  ]);
  const doneBy = new Map(doneRows.map((r) => [r.exerciseId, r.n]));

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 pt-6 pb-16 md:grid-cols-[1fr_22rem]">
      <section className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Übungen</h1>
        {exercises.length === 0 && <p className="text-muted-foreground">Noch keine Übungen. Leg deine erste an.</p>}
        <ul className="surface divide-y overflow-hidden">
          {exercises.map((e) => (
            <li key={e.id}>
              <Link href={`/trainer/uebungen/${e.slug}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3.5 transition-colors hover:bg-muted">
                <span className="font-semibold">{e.title}</span>
                <Badge variant="secondary">{e.category}</Badge>
                <span className="ml-auto text-sm text-muted-foreground">
                  {e.assigned} zugewiesen · <span className={doneBy.get(e.id) ? "font-semibold text-success-ink" : ""}>{doneBy.get(e.id) ?? 0} erledigt</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Card className="h-fit md:sticky md:top-20">
        <CardHeader><CardTitle>Neue Übung</CardTitle></CardHeader>
        <CardContent>
          <ActionForm action={createExercise} className="grid gap-3">
            <ExerciseFields categories={categories} />
            <Button type="submit">Anlegen</Button>
          </ActionForm>
        </CardContent>
      </Card>
    </main>
  );
}
