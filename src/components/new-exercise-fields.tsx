"use client";

import { use } from "react";
import { ExerciseFields } from "@/components/exercise-fields";
import { PlanPickerField } from "@/components/plan-picker-field";

type Option = { value: string; label: string };

/** Create-exercise fields fed by a promise, so the "Neue Übung" button needs no data; wrap in Suspense. */
export function NewExerciseFields({ data }: { data: Promise<{ categories: Option[]; plans: Option[] }> }) {
  const { categories, plans } = use(data);
  return (
    <>
      <ExerciseFields categories={categories} />
      <PlanPickerField plans={plans} />
    </>
  );
}
