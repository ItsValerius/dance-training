import { Checkbox } from "@/components/ui/checkbox";

export function CheckList({ legend, name, items }: { legend: string; name: string; items: { id: string; label: string; checked: boolean }[] }) {
  return (
    <fieldset className="surface space-y-1 p-4">
      <legend className="float-left mb-2 w-full text-sm font-bold">{legend}</legend>
      {items.length === 0 && <p className="text-sm text-muted-foreground">Noch keine.</p>}
      {items.map((i) => (
        <label key={i.id} className="-mx-2 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 transition-colors hover:bg-muted">
          <Checkbox name={name} value={i.id} defaultChecked={i.checked} />
          {i.label}
        </label>
      ))}
    </fieldset>
  );
}
