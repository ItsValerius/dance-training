"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      onClick={async () => {
        await authClient.signOut();
        // a real page load, not router.replace: Next keeps visited pages alive in the background, and their
        // state (plan order, folded plans, an open menu) would otherwise carry over to the next person who logs in
        window.location.assign("/anmelden");
      }}
    >
      Abmelden
    </Button>
  );
}
