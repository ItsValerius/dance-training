import { count, desc, eq } from "drizzle-orm";
import { CreateDialog } from "@/components/create-dialog";
import { PlanFields } from "@/components/plan-fields";
import { PlansTable } from "@/components/plans-table";
import { db } from "@/db";
import { planExercise, trainingPlan } from "@/db/schema";
import { requireTrainer } from "@/lib/auth";
import { formatDue, today } from "@/lib/queries";
import { createPlan } from "../actions";

export default async function PlansPage() {
  await requireTrainer();
  const plans = await db
    .select({ id: trainingPlan.id, title: trainingPlan.title, dueDate: trainingPlan.dueDate, exercises: count(planExercise.exerciseId) })
    .from(trainingPlan)
    .leftJoin(planExercise, eq(planExercise.planId, trainingPlan.id))
    .groupBy(trainingPlan.id)
    .orderBy(desc(trainingPlan.dueDate));
  const t = today();

  return (
    <main className="mx-auto w-full max-w-5xl space-y-4 px-4 pt-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Trainingspläne</h1>
        <CreateDialog label="Neuer Plan" title="Neuer Trainingsplan" action={createPlan}>
          <PlanFields />
        </CreateDialog>
      </div>
      <PlansTable plans={plans.map((p) => ({ ...p, due: formatDue(p.dueDate), expired: p.dueDate < t }))} />
    </main>
  );
}
