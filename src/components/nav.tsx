import Link from "next/link";
import { Suspense } from "react";
import { getSession, isTrainer } from "@/lib/auth";
import { ModeToggle } from "./mode-toggle";
import { NavLinks } from "./nav-links";
import { SignOutButton } from "./sign-out-button";

/** Bar and wordmark are static (in the prerendered shell); only the session-dependent parts stream in. */
export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <nav className="mx-auto flex max-w-5xl items-center gap-x-2 px-4 md:gap-x-4 md:py-2">
        {/* "/" sends trainers on to their plans */}
        <Link href="/" className="flex h-14 items-center text-lg font-extrabold tracking-tight text-primary md:h-12">
          Tanztraining
        </Link>
        <Suspense>
          <NavSession />
        </Suspense>
      </nav>
    </header>
  );
}

async function NavSession() {
  const session = await getSession();
  if (!session) return null;
  return (
    <>
      {/* below md: menu button at the right edge; md+: tabs after the logo (4 trainer tabs need the room) */}
      <div className="flex items-center max-md:order-last max-md:ml-auto">
        <NavLinks
          role={isTrainer(session.user) ? "trainer" : "student"}
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
      <div className="ml-auto flex items-center gap-1 max-md:hidden">
        <span className="mr-1 hidden max-w-40 truncate text-sm font-semibold text-muted-foreground lg:block">{session.user.name}</span>
        <ModeToggle />
        <SignOutButton />
      </div>
    </>
  );
}
