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
      <nav className="mx-auto flex max-w-5xl items-center gap-x-2 px-4 sm:gap-x-4 sm:py-2">
        <Link href="/" className="flex h-14 items-center text-lg font-extrabold tracking-tight text-primary sm:h-12">
          Tanztraining
        </Link>
        {/* phones: menu button at the right edge; sm+: tabs after the logo */}
        <div className="flex items-center max-sm:order-last max-sm:ml-auto">
          <NavLinks
            role={trainer ? "trainer" : "student"}
            account={
              <>
                <span className="mr-auto truncate font-semibold text-muted-foreground">{session.user.name}</span>
                <ModeToggle />
                <SignOutButton />
              </>
            }
          />
        </div>
        {/* on phones these live in the menu sheet */}
        <div className="ml-auto flex items-center gap-1 max-sm:hidden">
          <span className="mr-1 hidden max-w-40 truncate text-sm font-semibold text-muted-foreground sm:block">{session.user.name}</span>
          <ModeToggle />
          <SignOutButton />
        </div>
      </nav>
    </header>
  );
}
