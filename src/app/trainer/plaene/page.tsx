import { count, desc, eq } from "drizzle-orm";
import { CreateDialog } from "@/components/create-dialog";
import { PlanFields } from "@/components/plan-fields";
import { PlansTable } from "@/components/plans-table";
import { db } from "@/db";
import { assignment, group, planExercise, trainingPlan, user } from "@/db/schema";
import { requireTrainer } from "@/lib/auth";
import { formatDue, planProgress, today } from "@/lib/queries";
import { createPlan } from "../actions";

export default async function PlansPage() {
  await requireTrainer();
  const plans = await db
    .select({ id: trainingPlan.id, title: trainingPlan.title, dueDate: trainingPlan.dueDate, exercises: count(planExercise.exerciseId) })
    .from(trainingPlan)
    .leftJoin(planExercise, eq(planExercise.planId, trainingPlan.id))
    .groupBy(trainingPlan.id)
    .orderBy(desc(trainingPlan.dueDate));
  const targets = await db
    .select({ planId: assignment.planId, group: group.name, student: user.name })
    .from(assignment)
    .leftJoin(group, eq(group.id, assignment.groupId))
    .leftJoin(user, eq(user.id, assignment.userId))
    .where(eq(assignment.excluded, false));
  // shortcut: one progress query per plan; fine for a club's dozens of plans, batch it if that grows
  const progress = await Promise.all(plans.map((p) => planProgress(p.id)));
  const t = today();

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Trainingspläne</h1>
        <CreateDialog label="Neuer Plan" title="Neuer Trainingsplan" action={createPlan}>
          <PlanFields />
        </CreateDialog>
      </div>
      <PlansTable
        plans={plans.map((p, i) => {
          const mine = targets.filter((a) => a.planId === p.id);
          const reached = progress[i];
          return {
            ...p,
            due: formatDue(p.dueDate),
            expired: p.dueDate < t,
            // groups first, then students assigned one by one
            audience: [...mine.flatMap((a) => (a.group ? [a.group] : [])), ...mine.flatMap((a) => (a.student ? [a.student] : []))],
            reached: reached.length,
            finished: p.exercises > 0 ? reached.filter((r) => r.done >= p.exercises).length : 0,
          };
        })}
      />
    </main>
  );
}
