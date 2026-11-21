import { Clapperboard } from "lucide-react";
import { redirect } from "next/navigation";
import { ViewTransition } from "react";
import { CelebrateDisc } from "@/components/celebrate-disc";
import { ExerciseList } from "@/components/exercise-list";
import { ProgressBar } from "@/components/progress-bar";
import { ProgressToast } from "@/components/progress-toast";
import { isTrainer, requireUser } from "@/lib/auth";
import { exercisesForStudent } from "@/lib/queries";

export default async function Home({ searchParams }: PageProps<"/">) {
  const me = await requireUser();
  const { willkommen } = await searchParams;
  if (isTrainer(me)) redirect("/trainer");
  const exercises = await exercisesForStudent(me.id);
  const groups = [...Map.groupBy(exercises, (e) => e.category)].map(([category, items]) => ({
    category,
    items: items.map((e) => ({ id: e.id, title: e.title, description: e.description, youtubeId: e.youtubeId, done: !!e.completedAt })),
  }));
  const done = exercises.filter((e) => e.completedAt).length;
  const open = exercises.length - done;
  const firstName = me.name.split(" ")[0];
  const trainers = [...new Set(exercises.map((e) => e.trainer).filter((t): t is string => !!t))];
  const chosenBy = trainers.length === 0 ? "dein Trainer" : new Intl.ListFormat("de", { type: "conjunction" }).format(trainers);
  const next = groups.flatMap((g) => g.items).find((e) => !e.done);

  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-4 pt-6 pb-16">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight">Hallo, {firstName}!</h1>
        <p className="text-muted-foreground">
          {exercises.length === 0 ? "Hier erscheinen deine Übungen." : `Das ${trainers.length > 1 ? "haben" : "hat"} ${chosenBy} für dich ausgesucht.`}
        </p>
      </div>

      {willkommen && (
        <section aria-label="Willkommen" className="surface space-y-1 border-primary/30 bg-secondary p-5 text-secondary-foreground">
          <p className="text-lg font-extrabold">Willkommen bei Tanztraining!</p>
          <p>
            Dein Benutzername ist <strong className="font-extrabold">{me.username}</strong>. Merk ihn dir, du brauchst ihn zum Anmelden. Wir haben ihn dir
            auch per E-Mail geschickt.
          </p>
        </section>
      )}

      {exercises.length === 0 ? (
        <div className="surface flex flex-col items-center gap-3 px-6 py-12 text-center">
          <Clapperboard className="size-10 text-primary" strokeWidth={1.75} />
          <h2 className="text-xl font-bold">Noch keine Übungen</h2>
          <p className="max-w-sm text-muted-foreground">Sobald dein Trainer dir eine Übung zuweist, findest du sie hier.</p>
        </div>
      ) : (
        open === 0 ? (
          <ViewTransition name="progress-card" share="celebrate" default="none">
            <section aria-label="Fortschritt" className="surface flex items-center gap-4 border-success/40 bg-success-soft p-5">
              <CelebrateDisc />
              <div className="space-y-1">
                <p className="text-2xl font-extrabold tracking-tight text-success-ink">Alles geschafft!</p>
                <p className="text-pretty text-success-ink">
                  Alle {exercises.length} Übungen erledigt. Neue Übungen erscheinen hier, sobald es welche gibt.
                </p>
              </div>
            </section>
          </ViewTransition>
        ) : (
          <ViewTransition name="progress-card" share="progress-swap" default="none">
            <section aria-label="Fortschritt" className="surface space-y-3 p-5">
              <p className="text-lg font-bold">
                <span className="text-4xl font-extrabold tracking-tight">{done}</span>
                <span className="text-muted-foreground"> von {exercises.length}</span> erledigt
              </p>
              <ProgressBar done={done} total={exercises.length} />
            </section>
          </ViewTransition>
        )
      )}

      <ExerciseList groups={groups} />
      <ProgressToast done={done} total={exercises.length} nextId={next?.id} />
    </main>
  );
}
