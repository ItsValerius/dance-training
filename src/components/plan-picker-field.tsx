import Link from "next/link";
import { Label } from "@/components/ui/label";
import { MultiPicker } from "@/components/multi-picker";

/** "Add to plans" field for the create-exercise form; `defaultValue` preselects e.g. the next plan due. */
export function PlanPickerField({ plans, defaultValue }: { plans: { value: string; label: string }[]; defaultValue?: string[] }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor="planIds">In Trainingspläne (optional)</Label>
      <MultiPicker id="planIds" name="planIds" options={plans} defaultValue={defaultValue} placeholder="Pläne wählen" />
      {plans.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Gerade kein aktueller Plan. <Link href="/trainer/plaene" className="underline">Plan anlegen.</Link>
        </p>
      )}
    </div>
  );
}
