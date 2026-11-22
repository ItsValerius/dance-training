import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { ConfirmDelete } from "@/components/confirm-delete";
import { ExerciseFields } from "@/components/exercise-fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "@/components/video";
import { db } from "@/db";
import { category, exercise, exerciseCategory } from "@/db/schema";
import { requireTrainer } from "@/lib/auth";
import { categoryOptions } from "@/lib/queries";
import { deleteExercise, updateExercise } from "../../actions";

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
  const categories = await categoryOptions();

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-16">
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight break-words">{ex.title}</h1>
          {cats.map((c) => <Badge key={c.id} variant="secondary">{c.name}</Badge>)}
        </div>
        <div className="shrink-0">
          <ConfirmDelete action={deleteExercise.bind(null, ex.id)} title={`„${ex.title}“ löschen?`} description="Die Übung verschwindet aus allen Trainingsplänen, auch aus früheren." />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
        <div className="space-y-3">
          <Video id={ex.youtubeId} title={ex.title} />
          {ex.description && <p className="whitespace-pre-line text-muted-foreground">{ex.description}</p>}
        </div>
        <Card className="h-fit">
          <CardHeader><CardTitle>Bearbeiten</CardTitle></CardHeader>
          <CardContent>
            {/* key: remount with fresh defaults after a save */}
            <ActionForm key={JSON.stringify(defaults)} action={updateExercise.bind(null, ex.id, ex.slug)} resetOnSuccess={false} className="grid gap-3">
              <ExerciseFields categories={categories} defaults={defaults} />
              <Button type="submit">Speichern</Button>
            </ActionForm>
          </CardContent>
        </Card>
      </div>

    </main>
  );
}
