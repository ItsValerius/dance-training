import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiPicker } from "@/components/multi-picker";
import { Textarea } from "@/components/ui/textarea";

type Defaults = { title: string; categoryIds: string[]; youtubeId: string; description: string | null };

/** Form fields shared by "create exercise" and "edit exercise". */
export function ExerciseFields({ categories, defaults }: { categories: { value: string; label: string }[]; defaults?: Defaults }) {
  return (
    <>
      <div className="grid gap-1.5">
        <Label htmlFor="youtubeUrl">YouTube-Link</Label>
        <Input
          id="youtubeUrl"
          name="youtubeUrl"
          type="url"
          required
          placeholder="https://youtu.be/…"
          defaultValue={defaults && `https://youtu.be/${defaults.youtubeId}`}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="title">Titel</Label>
        <Input id="title" name="title" required maxLength={200} defaultValue={defaults?.title} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="categoryIds">Kategorien (optional)</Label>
        <MultiPicker id="categoryIds" name="categoryIds" options={categories} defaultValue={defaults?.categoryIds} placeholder="Kategorien wählen" />
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Noch keine Kategorien. <Link href="/trainer/kategorien" className="underline">Hier anlegen.</Link>
          </p>
        )}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="description">Beschreibung (optional)</Label>
        <Textarea id="description" name="description" maxLength={5000} defaultValue={defaults?.description ?? undefined} />
      </div>
    </>
  );
}
