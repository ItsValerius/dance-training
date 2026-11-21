"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <main className="mx-auto w-full max-w-2xl space-y-3 px-4 pt-6 pb-16">
      <h1 className="text-2xl font-extrabold tracking-tight">Etwas ist schiefgelaufen</h1>
      <p className="text-muted-foreground">Bitte versuch es noch einmal. Wenn es weiter passiert, sag deinem Trainer Bescheid.</p>
      <Button onClick={retry}>Erneut versuchen</Button>
    </main>
  );
}
