import { asc, count, eq } from "drizzle-orm";
import { ActionForm } from "@/components/action-form";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/db";
import { category, exercise } from "@/db/schema";
import { requireTrainer } from "@/lib/auth";
import { createCategory, deleteCategory } from "../actions";

export default async function CategoriesPage() {
  await requireTrainer();
  const categories = await db
    .select({ id: category.id, name: category.name, used: count(exercise.id) })
    .from(category)
    .leftJoin(exercise, eq(exercise.categoryId, category.id))
    .groupBy(category.id)
    .orderBy(asc(category.name));

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Kategorien</h1>
      <ActionForm action={createCategory} className="flex gap-2">
        <Input name="name" placeholder="Name der neuen Kategorie" aria-label="Name der neuen Kategorie" required maxLength={100} className="max-w-xs" />
        <Button type="submit">Kategorie anlegen</Button>
      </ActionForm>
      {categories.length === 0 && <p className="text-muted-foreground">Noch keine Kategorien.</p>}
      <ul className="surface divide-y overflow-hidden">
        {categories.map((c) => (
          <li key={c.id} className="flex min-h-14 items-center gap-3 px-4 py-2.5">
            <span className="font-semibold">{c.name}</span>
            <span className="ml-auto text-sm text-muted-foreground">{c.used} {c.used === 1 ? "Übung" : "Übungen"}</span>
            {c.used === 0 && (
              <ConfirmDelete action={deleteCategory.bind(null, c.id)} title={`Kategorie „${c.name}“ löschen?`} description="Sie wird von keiner Übung verwendet." />
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
