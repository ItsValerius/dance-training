import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { ConfirmDelete } from "@/components/confirm-delete";
import { ExerciseFields } from "@/components/exercise-fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "@/components/video";
import { CheckList } from "@/components/check-list";
import { db } from "@/db";
import { assignment, category, exercise, group } from "@/db/schema";
import { requireTrainer } from "@/lib/auth";
import { categoryOptions, exerciseProgress, students } from "@/lib/queries";
import { ProgressBar } from "@/components/progress-bar";
import { Check } from "lucide-react";
import { deleteExercise, setAssignments, updateExercise } from "../../actions";

export default async function ExercisePage({ params }: PageProps<"/trainer/uebungen/[slug]">) {
  await requireTrainer();
  const { slug } = await params;
  const ex = await db
    .select({ id: exercise.id, slug: exercise.slug, title: exercise.title, description: exercise.description, youtubeId: exercise.youtubeId, categoryId: exercise.categoryId, category: category.name })
    .from(exercise)
    .innerJoin(category, eq(category.id, exercise.categoryId))
    .where(eq(exercise.slug, slug))
    .get();
  if (!ex) notFound();
  const [allStudents, groups, assigned, categories, progress] = await Promise.all([
    students(),
    db.select().from(group).orderBy(asc(group.name)),
    db.select().from(assignment).where(eq(assignment.exerciseId, ex.id)),
    categoryOptions(),
    exerciseProgress(ex.id),
  ]);
  const doneCount = progress.filter((p) => p.completedAt).length;
  const assignedUsers = new Set(assigned.map((a) => a.userId));
  const assignedGroups = new Set(assigned.map((a) => a.groupId));

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-16">
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight break-words">{ex.title}</h1>
          <Badge variant="secondary">{ex.category}</Badge>
        </div>
        <div className="shrink-0">
          <ConfirmDelete action={deleteExercise.bind(null, ex.id)} title={`„${ex.title}“ löschen?`} description="Die Übung verschwindet für alle Schüler, denen sie zugewiesen ist." />
        </div>
      </div>
      <section className="surface space-y-4 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-bold">Fortschritt</h2>
          {progress.length > 0 && <p className="font-semibold">{doneCount} von {progress.length} erledigt</p>}
        </div>
        {progress.length === 0 ? (
          <p className="text-muted-foreground">Noch niemandem zugewiesen. Wähl unten Gruppen oder Schüler aus.</p>
        ) : (
          <>
            <ProgressBar done={doneCount} total={progress.length} />
            <ul className="flex flex-wrap gap-2">
              {progress.map((p) => (
                <li
                  key={p.id}
                  className={p.completedAt ? "flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1.5 text-sm font-semibold text-success-ink" : "rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground"}
                >
                  {p.completedAt && <Check aria-hidden className="size-4 stroke-3" />}
                  {p.name}
                  <span className="sr-only">{p.completedAt ? ": erledigt" : ": offen"}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
        <div className="space-y-3">
          <Video id={ex.youtubeId} title={ex.title} />
          {ex.description && <p className="whitespace-pre-line text-muted-foreground">{ex.description}</p>}
        </div>
        <Card className="h-fit">
          <CardHeader><CardTitle>Bearbeiten</CardTitle></CardHeader>
          <CardContent>
            {/* key: remount with fresh defaults after a save */}
            <ActionForm key={JSON.stringify(ex)} action={updateExercise.bind(null, ex.id, ex.slug)} resetOnSuccess={false} className="grid gap-3">
              <ExerciseFields categories={categories} defaults={ex} />
              <Button type="submit">Speichern</Button>
            </ActionForm>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Zugewiesen an</h2>
        <ActionForm action={setAssignments.bind(null, ex.id)} resetOnSuccess={false} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <CheckList legend="Gruppen" name="groupIds" items={groups.map((g) => ({ id: g.id, label: g.name, checked: assignedGroups.has(g.id) }))} />
            <CheckList legend="Schüler" name="userIds" items={allStudents.map((s) => ({ id: s.id, label: `${s.name} (${s.username})`, checked: assignedUsers.has(s.id) }))} />
          </div>
          <Button type="submit" className="w-fit">Zuweisungen speichern</Button>
        </ActionForm>
      </section>
    </main>
  );
}
