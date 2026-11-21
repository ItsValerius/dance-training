import Link from "next/link";
import { getSession, isTrainer } from "@/lib/auth";
import { ModeToggle } from "./mode-toggle";
import { NavLinks } from "./nav-links";
import { SignOutButton } from "./sign-out-button";

export async function Nav() {
  const session = await getSession();
  if (!session) return null;
  const trainer = isTrainer(session.user);
  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 px-4 sm:flex-nowrap sm:py-2">
        <Link href="/" className="flex h-14 items-center text-lg font-extrabold tracking-tight text-primary sm:h-12">
          Tanztraining
        </Link>
        {trainer && (
          <div className="order-last w-full sm:order-none sm:w-auto">
            <NavLinks />
          </div>
        )}
        <div className="ml-auto flex items-center gap-1">
          <span className="mr-1 hidden max-w-40 truncate text-sm font-semibold text-muted-foreground sm:block">{session.user.name}</span>
          <ModeToggle />
          <SignOutButton />
        </div>
      </nav>
    </header>
  );
}
