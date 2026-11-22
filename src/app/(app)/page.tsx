import { Clapperboard } from "lucide-react";
import { redirect } from "next/navigation";
import { PlanStack } from "@/components/plan-stack";
import { PlanView } from "@/components/plan-view";
import { isTrainer, requireUser } from "@/lib/auth";
import { doneCounts, planExerciseIds, plansForStudent } from "@/lib/queries";

export default async function Home({ searchParams }: PageProps<"/">) {
  const me = await requireUser();
  const { willkommen } = await searchParams;
  if (isTrainer(me)) redirect("/trainer/plaene");
  const plans = await plansForStudent(me.id, "current");
  const ids = plans.map((p) => p.id);
  const [counts, links] = await Promise.all([doneCounts(me.id, ids), planExerciseIds(ids)]);
  const title = new Map(plans.map((p) => [p.id, p.title]));
  // the same exercise can sit in two current plans; each copy names the other plans it's in
  const alsoIn = (planId: string) =>
    Object.fromEntries(
      links
        .filter((l) => l.planId === planId)
        .map((l) => [l.exerciseId, links.filter((o) => o.exerciseId === l.exerciseId && o.planId !== planId).map((o) => title.get(o.planId)!)]),
    );
  const firstName = me.name.split(" ")[0];

  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-4 pt-6 pb-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Hallo, {firstName}!</h1>

      {willkommen && (
        <section aria-label="Willkommen" className="surface space-y-1 border-primary/30 bg-secondary p-5 text-secondary-foreground">
          <p className="text-lg font-extrabold">Willkommen bei Tanztraining!</p>
          <p>
            Du meldest dich ab jetzt mit <strong className="font-extrabold">{me.email}</strong> und deinem Passwort an.
          </p>
        </section>
      )}

      {plans.length > 0 ? (
        <PlanStack
          plans={plans.map((plan) => {
            const c = counts.get(plan.id)!;
            return { id: plan.id, title: plan.title, finished: c.total > 0 && c.done === c.total, view: <PlanView userId={me.id} plan={plan} alsoIn={alsoIn(plan.id)} /> };
          })}
        />
      ) : (
        <div className="surface flex flex-col items-center gap-3 px-6 py-12 text-center">
          <Clapperboard className="size-10 text-primary" strokeWidth={1.75} />
          <h2 className="text-xl font-bold">Gerade kein Trainingsplan</h2>
          <p className="max-w-sm text-muted-foreground">Sobald dein Trainer dir einen Trainingsplan gibt, findest du ihn hier.</p>
        </div>
      )}
    </main>
  );
}
