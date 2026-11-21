import { cn } from "cn";

/** Done-of-total bar; the plum "success" colour is reserved for "done". */
export function ProgressBar({ done, total, className }: { done: number; total: number; className?: string }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-label={`${done} von ${total} erledigt`}
      className={cn("h-4 overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className="h-full rounded-full bg-success transition-[width] duration-500 ease-enter motion-reduce:transition-none"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
