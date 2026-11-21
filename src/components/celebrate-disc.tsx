"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { tickedRecently } from "@/lib/celebrate";

/** The all-done check; when it appears because of a tick just now, one ring bursts out of it. */
export function CelebrateDisc() {
  const [burst] = useState(tickedRecently);
  return (
    <span className="relative grid size-14 shrink-0 place-items-center rounded-full bg-success text-success-foreground">
      {burst && <span aria-hidden className="celebrate-burst absolute inset-0 rounded-full border-4 border-success motion-reduce:hidden" />}
      <Check aria-hidden className="size-8 stroke-3" />
    </span>
  );
}
