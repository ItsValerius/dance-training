import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlanView } from "@/components/plan-view";
import { requireUser } from "@/lib/auth";
import { planForStudent, today } from "@/lib/queries";

export default async function PastPlanPage({ params }: PageProps<"/verlauf/[id]">) {
  const me = await requireUser();
  const { id } = await params;
  const plan = await planForStudent(me.id, id);
  if (!plan) notFound();
  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-4 pt-6 pb-16">
      <div className="mb-4">{/* overrides space-y-8: the back link sits close to the plan */}
        <Link href="/verlauf" className="-ml-1 inline-flex min-h-11 items-center gap-1.5 px-1 font-semibold text-primary underline-offset-4 hover:underline">
          <ArrowLeft aria-hidden className="size-4" />
          Frühere Pläne
        </Link>
        <h1 className="sr-only">{plan.title}</h1>
      </div>
      <PlanView userId={me.id} plan={plan} past={plan.dueDate < today()} />
    </main>
  );
}
