import Link from "next/link";
import { notFound } from "next/navigation";
import { PlanView } from "@/components/plan-view";
import { requireUser } from "@/lib/auth";
import { planForStudent } from "@/lib/queries";

export default async function PastPlanPage({ params }: PageProps<"/verlauf/[id]">) {
  const me = await requireUser();
  const { id } = await params;
  const plan = await planForStudent(me.id, id);
  if (!plan) notFound();
  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-4 pt-6 pb-16">
      <Link href="/verlauf" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
        ← Frühere Pläne
      </Link>
      <PlanView userId={me.id} plan={plan} />
    </main>
  );
}
