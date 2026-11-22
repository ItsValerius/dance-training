import Link from "next/link";
import { redirect } from "next/navigation";
import { isTrainer, requireUser } from "@/lib/auth";
import { doneCounts, formatDue, plansForStudent } from "@/lib/queries";

export default async function HistoryPage() {
  const me = await requireUser();
  if (isTrainer(me)) redirect("/trainer/plaene");
  const plans = await plansForStudent(me.id, "past");
  const counts = await doneCounts(me.id, plans.map((p) => p.id));

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 pt-6 pb-16">
      <h1 className="text-2xl font-extrabold tracking-tight">Frühere Pläne</h1>
      {plans.length === 0 ? (
        <p className="text-muted-foreground">Noch keine abgelaufenen Trainingspläne.</p>
      ) : (
        <ul className="surface divide-y overflow-hidden">
          {plans.map((p) => {
            const c = counts.get(p.id)!;
            return (
              <li key={p.id}>
                <Link href={`/verlauf/${p.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3.5 transition-colors hover:bg-muted">
                  <span className="font-semibold">{p.title}</span>
                  <span className="text-sm text-muted-foreground">bis {formatDue(p.dueDate)}</span>
                  <span className={c.total && c.done === c.total ? "ml-auto text-sm font-semibold text-success-ink" : "ml-auto text-sm text-muted-foreground"}>
                    {c.done} von {c.total} erledigt
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
