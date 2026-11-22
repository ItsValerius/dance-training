import Link from "next/link";
import { Button } from "@/components/ui/button";

/** For a plan or exercise that no longer exists (e.g. another trainer deleted it); shown under the nav. */
export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-3 px-4 pt-6 pb-16">
      <h1 className="text-2xl font-extrabold tracking-tight">Nicht gefunden</h1>
      <p className="text-muted-foreground">Das gibt es nicht mehr, oder der Link ist falsch.</p>
      <Button render={<Link href="/" />}>Zur Startseite</Button>
    </main>
  );
}
