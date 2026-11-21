import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Centered card layout shared by login, invite and password pages. */
export function AuthShell({ title, children, footer }: { title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="space-y-1 text-center">
        <p className="text-2xl font-extrabold tracking-tight text-primary">Tanztraining</p>
        <p className="text-muted-foreground">Deine Übungen von deinem Trainer</p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold">{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      {footer && <div className="max-w-xs text-center text-sm text-muted-foreground">{footer}</div>}
    </main>
  );
}
