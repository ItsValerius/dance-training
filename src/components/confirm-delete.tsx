"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** `label` turns the trigger into an icon button (for table rows and chips) with that accessible name. */
export function ConfirmDelete({ action, title, description, label }: { action: () => Promise<void>; title: string; description: string; label?: string }) {
  return (
    <AlertDialog>
      {label ? (
        <AlertDialogTrigger render={<Button variant="ghost" size="icon" aria-label={label} className="text-destructive" />}>
          <Trash2 aria-hidden />
        </AlertDialogTrigger>
      ) : (
        <AlertDialogTrigger render={<Button variant="destructive" />}>Löschen</AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          {/* contents: the button itself is the footer's flex item, so it goes full width on phones like Abbrechen */}
          <form action={action} className="contents">
            <Button type="submit" variant="destructive">Löschen</Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
