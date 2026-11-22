import { Clapperboard } from "lucide-react";
import { redirect } from "next/navigation";
import { PlanView } from "@/components/plan-view";
import { isTrainer, requireUser } from "@/lib/auth";
import { plansForStudent } from "@/lib/queries";

export default async function Home({ searchParams }: PageProps<"/">) {
  const me = await requireUser();
  const { willkommen } = await searchParams;
  if (isTrainer(me)) redirect("/trainer");
  const plans = await plansForStudent(me.id, "current");
  const firstName = me.name.split(" ")[0];

  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-4 pt-6 pb-16">
      <h1 className="text-2xl font-extrabold tracking-tight">Hallo, {firstName}!</h1>

      {willkommen && (
        <section aria-label="Willkommen" className="surface space-y-1 border-primary/30 bg-secondary p-5 text-secondary-foreground">
          <p className="text-lg font-extrabold">Willkommen bei Tanztraining!</p>
          <p>
            Du meldest dich ab jetzt mit <strong className="font-extrabold">{me.email}</strong> und deinem Passwort an.
          </p>
        </section>
      )}

      {plans.length > 0 ? (
        // several groups or direct assignments can overlap: show every plan not yet due, soonest first
        <div className="space-y-8">
          {plans.map((plan) => (
            <section key={plan.id} aria-label={plan.title} className="space-y-8 not-first:border-t not-first:pt-8">
              <PlanView userId={me.id} plan={plan} />
            </section>
          ))}
        </div>
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
