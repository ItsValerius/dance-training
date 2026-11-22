"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";

export type ActionResult = { error?: string; ok?: number } | undefined;

/** Form bound to a server action; shows the returned error, keeps input on error, resets on success. */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = true,
  onSuccess,
}: {
  action: (prev: ActionResult, data: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state?.ok) return;
    if (resetOnSuccess) ref.current?.reset();
    onSuccess?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per success, not when the callback identity changes
  }, [state?.ok]);

  return (
    <form
      ref={ref}
      className={className}
      // not `action=`: React 19 clears `action` forms after every submit, which wipes input on errors
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      <fieldset disabled={pending} className="contents">{children}</fieldset>
      {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
