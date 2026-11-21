import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Defaults = { title: string; categoryId: string; youtubeId: string; description: string | null };

/** Form fields shared by "create exercise" and "edit exercise". */
export function ExerciseFields({ categories, defaults }: { categories: { value: string; label: string }[]; defaults?: Defaults }) {
  return (
    <>
      <div className="grid gap-1.5">
        <Label htmlFor="title">Titel</Label>
        <Input id="title" name="title" required maxLength={200} defaultValue={defaults?.title} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="categoryId">Kategorie</Label>
        <Select name="categoryId" required items={categories} defaultValue={defaults?.categoryId}>
          <SelectTrigger id="categoryId" className="w-full">
            <SelectValue placeholder="Kategorie wählen" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Noch keine Kategorien. <Link href="/trainer/kategorien" className="underline">Leg zuerst eine an.</Link>
          </p>
        )}
      </div>
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
        <Label htmlFor="description">Beschreibung (optional)</Label>
        <Textarea id="description" name="description" maxLength={5000} defaultValue={defaults?.description ?? undefined} />
      </div>
    </>
  );
}
