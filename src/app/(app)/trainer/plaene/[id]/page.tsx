import { asc, eq } from "drizzle-orm";
import { Pencil, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssignPicker, type Target } from "@/components/assign-picker";
import { ConfirmDelete } from "@/components/confirm-delete";
import { AddExercisesDialog } from "@/components/add-exercises-dialog";
import { CreateDialog } from "@/components/create-dialog";
import { PlanFields } from "@/components/plan-fields";
import { ProgressBar } from "@/components/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { assignment, exercise, group, groupMember, planExercise, trainingPlan } from "@/db/schema";
import { requireTrainer } from "@/lib/auth";
import { categoriesByExercise, categoryOptions, formatDue, planProgress, students } from "@/lib/queries";
import { addPlanExercise, createExercise, deletePlan, removePlanExercise, setAssignments, updatePlan } from "../../actions";

export default async function PlanPage({ params }: PageProps<"/trainer/plaene/[id]">) {
  await requireTrainer();
  const { id } = await params;
  const plan = await db.query.trainingPlan.findFirst({ where: eq(trainingPlan.id, id) });
  if (!plan) notFound();
  const [allStudents, groups, members, assigned, allExercises, inPlan, progress, cats, categories] = await Promise.all([
    students(),
    db.select().from(group).orderBy(asc(group.name)),
    db.select({ userId: groupMember.userId, groupId: groupMember.groupId }).from(groupMember),
    db.select().from(assignment).where(eq(assignment.planId, id)),
    db.select({ id: exercise.id, slug: exercise.slug, title: exercise.title }).from(exercise).orderBy(asc(exercise.title)),
    db.select({ id: planExercise.exerciseId }).from(planExercise).where(eq(planExercise.planId, id)),
    planProgress(id),
    categoriesByExercise(),
    categoryOptions(),
  ]);
  const chosen = new Set(inPlan.map((e) => e.id));
  const total = chosen.size;
  const available = allExercises.filter((e) => !chosen.has(e.id)).map((e) => ({ value: e.id, label: e.title, tags: cats.get(e.id)?.map((c) => c.name) }));
  const finished = progress.filter((p) => total > 0 && p.done >= total).length;
  const membersOf = Map.groupBy(members, (m) => m.groupId);
  const targets: Target[] = [
    ...groups.map((g) => ({ value: `g:${g.id}`, label: g.name, members: membersOf.get(g.id)?.map((m) => m.userId) ?? [] })),
    ...allStudents.map((s) => ({ value: `u:${s.id}`, label: s.name, hint: s.email })),
  ];
  const initial = assigned.map((a) => (a.groupId ? `g:${a.groupId}` : `${a.excluded ? "x" : "u"}:${a.userId}`)).sort();

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-16">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-extrabold tracking-tight break-words">{plan.title}</h1>
          <p className="text-muted-foreground">fällig am {formatDue(plan.dueDate)}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <CreateDialog label="Bearbeiten" title="Plan bearbeiten" submitLabel="Speichern" icon={<Pencil aria-hidden />} variant="outline" compact action={updatePlan.bind(null, plan.id)}>
            <PlanFields id="edit" defaults={plan} />
          </CreateDialog>
          <ConfirmDelete action={deletePlan.bind(null, plan.id)} title={`„${plan.title}“ löschen?`} description="Der Fortschritt geht verloren, Übungen bleiben." />
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="min-w-0 flex-1 text-xl font-bold">Übungen</h2>
          <AddExercisesDialog
            planId={plan.id}
            planTitle={plan.title}
            exercises={available}
            categories={categories}
            add={addPlanExercise.bind(null, plan.id)}
            create={createExercise}
          />
        </div>
        {total === 0 ? (
          <p className="text-muted-foreground">Noch keine Übungen im Plan.</p>
        ) : (
          <ul className="surface divide-y overflow-hidden">
            {allExercises.filter((e) => chosen.has(e.id)).map((e) => (
              <li key={e.id} className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 py-1.5 pr-2 pl-4">
                <Link href={`/trainer/uebungen/${e.slug}`} className="font-semibold underline-offset-4 hover:underline">{e.title}</Link>
                {cats.get(e.id)?.map((c) => <Badge key={c.id} variant="secondary">{c.name}</Badge>)}
                <form action={removePlanExercise.bind(null, plan.id, e.id)} className="ml-auto">
                  <Button type="submit" variant="ghost" size="icon" aria-label={`${e.title} aus dem Plan entfernen`}>
                    <X aria-hidden />
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        {/* no key: the picker saves itself on every change and stays the source of truth while open */}
        <AssignPicker
          action={setAssignments.bind(null, plan.id)}
          targets={targets}
          initial={initial}
          done={Object.fromEntries(progress.map((p) => [p.id, p.done]))}
          total={total}
        >
          {progress.length > 0 && total > 0 && (
            <div className="space-y-2">
              <p className="font-semibold">{finished} von {progress.length} fertig</p>
              <ProgressBar done={finished} total={progress.length} />
            </div>
          )}
        </AssignPicker>
      </section>
    </main>
  );
}

