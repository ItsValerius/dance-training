import { asc, eq } from "drizzle-orm";
import { X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { AssignPicker, type Target } from "@/components/assign-picker";
import { ConfirmDelete } from "@/components/confirm-delete";
import { PlanFields } from "@/components/plan-fields";
import { ProgressBar } from "@/components/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/db";
import { assignment, exercise, group, groupMember, planExercise, trainingPlan } from "@/db/schema";
import { requireTrainer } from "@/lib/auth";
import { categoriesByExercise, formatDue, planProgress, students } from "@/lib/queries";
import { addPlanExercise, deletePlan, removePlanExercise, setAssignments, updatePlan } from "../../actions";

export default async function PlanPage({ params }: PageProps<"/trainer/plaene/[id]">) {
  await requireTrainer();
  const { id } = await params;
  const plan = await db.query.trainingPlan.findFirst({ where: eq(trainingPlan.id, id) });
  if (!plan) notFound();
  const [allStudents, groups, members, assigned, allExercises, inPlan, progress, cats] = await Promise.all([
    students(),
    db.select().from(group).orderBy(asc(group.name)),
    db.select({ userId: groupMember.userId, groupId: groupMember.groupId }).from(groupMember),
    db.select().from(assignment).where(eq(assignment.planId, id)),
    db.select({ id: exercise.id, slug: exercise.slug, title: exercise.title }).from(exercise).orderBy(asc(exercise.title)),
    db.select({ id: planExercise.exerciseId }).from(planExercise).where(eq(planExercise.planId, id)),
    planProgress(id),
    categoriesByExercise(),
  ]);
  const chosen = new Set(inPlan.map((e) => e.id));
  const total = chosen.size;
  const catsOf = (id: string) => cats.get(id)?.map((c) => c.name).join(", ");
  const available = allExercises.filter((e) => !chosen.has(e.id)).map((e) => ({ value: e.id, label: catsOf(e.id) ? `${e.title} (${catsOf(e.id)})` : e.title }));
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
          <p className="text-muted-foreground">bis {formatDue(plan.dueDate)}</p>
        </div>
        <div className="shrink-0">
          <ConfirmDelete action={deletePlan.bind(null, plan.id)} title={`„${plan.title}“ löschen?`} description="Der Plan und der Fortschritt der Schüler darin verschwinden. Die Übungen bleiben erhalten." />
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Bearbeiten</h2>
        {/* key: remount with fresh defaults after a save */}
        <ActionForm key={`${plan.title}|${plan.dueDate}`} action={updatePlan.bind(null, plan.id)} resetOnSuccess={false} className="grid max-w-md gap-3">
          <PlanFields id="edit" defaults={plan} />
          <Button type="submit" className="w-fit">Speichern</Button>
        </ActionForm>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Übungen</h2>
        {/* key: remount so the select clears and drops the just-added exercise */}
        <ActionForm key={total} action={addPlanExercise.bind(null, plan.id)} className="flex flex-wrap gap-2">
          <Select name="exerciseId" required items={available}>
            <SelectTrigger aria-label="Übung hinzufügen" className="min-w-0 flex-1 sm:max-w-sm">
              <SelectValue placeholder={available.length ? "Übung wählen" : "Alle Übungen sind im Plan"} />
            </SelectTrigger>
            <SelectContent>
              {available.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={!available.length}>Hinzufügen</Button>
        </ActionForm>
        {total === 0 ? (
          <p className="text-muted-foreground">Noch keine Übungen im Plan.</p>
        ) : (
          <ul className="surface divide-y overflow-hidden">
            {allExercises.filter((e) => chosen.has(e.id)).map((e) => (
              <li key={e.id} className="flex min-h-14 items-center gap-3 px-4 py-2">
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
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-bold">Zugewiesen an</h2>
          {progress.length > 0 && total > 0 && <p className="font-semibold">{finished} von {progress.length} fertig</p>}
        </div>
        {progress.length > 0 && total > 0 && <ProgressBar done={finished} total={progress.length} />}
        {/* key: re-sync the picker with the saved state after a save */}
        <AssignPicker
          key={initial.join()}
          action={setAssignments.bind(null, plan.id)}
          targets={targets}
          initial={initial}
          done={Object.fromEntries(progress.map((p) => [p.id, p.done]))}
          total={total}
        />
      </section>
    </main>
  );
}

