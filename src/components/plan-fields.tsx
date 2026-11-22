import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Title + due date, shared by create, edit and duplicate. `id` keeps label ids unique when several forms share a page. */
export function PlanFields({ id = "plan", defaults }: { id?: string; defaults?: { title: string; dueDate?: string } }) {
  return (
    <>
      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-title`}>Titel</Label>
        <Input id={`${id}-title`} name="title" required maxLength={200} defaultValue={defaults?.title} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-due`}>Fällig am</Label>
        <Input id={`${id}-due`} name="dueDate" type="date" required defaultValue={defaults?.dueDate} />
      </div>
    </>
  );
}
