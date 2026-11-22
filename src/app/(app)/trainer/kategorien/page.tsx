import { asc, count, eq } from "drizzle-orm";
import { Suspense } from "react";
import { CreateDialog } from "@/components/create-dialog";
import { ConfirmDelete } from "@/components/confirm-delete";
import { LineSkeleton } from "@/components/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/db";
import { category, exerciseCategory } from "@/db/schema";
import { requireTrainer } from "@/lib/auth";
import { createCategory, deleteCategory } from "../actions";

export default function CategoriesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Kategorien</h1>
        <CreateDialog label="Neue Kategorie" title="Neue Kategorie" action={createCategory}>
          <div className="grid gap-1.5">
            <Label htmlFor="category-name">Name</Label>
            <Input id="category-name" name="name" required maxLength={100} />
          </div>
        </CreateDialog>
      </div>
      {/* only the data waits; heading and create button are in the static shell */}
      <Suspense fallback={<LineSkeleton />}>
        <Categories />
      </Suspense>
    </main>
  );
}

async function Categories() {
  await requireTrainer();
  const categories = await db
    .select({ id: category.id, name: category.name, used: count(exerciseCategory.exerciseId) })
    .from(category)
    .leftJoin(exerciseCategory, eq(exerciseCategory.categoryId, category.id))
    .groupBy(category.id)
    .orderBy(asc(category.name));

  return categories.length === 0 ? (
      <p className="text-muted-foreground">Noch keine Kategorien.</p>
    ) : (
      <ul className="surface divide-y overflow-hidden">
        {categories.map((c) => (
          <li key={c.id} className="flex min-h-14 items-center gap-3 px-4 py-2.5">
            <span className="font-semibold">{c.name}</span>
            <span className="ml-auto text-sm text-muted-foreground">{c.used} {c.used === 1 ? "Übung" : "Übungen"}</span>
            {c.used === 0 && (
              <ConfirmDelete action={deleteCategory.bind(null, c.id)} title={`Kategorie „${c.name}“ löschen?`} description="Keine Übung nutzt sie." />
            )}
          </li>
        ))}
      </ul>
  );
}
