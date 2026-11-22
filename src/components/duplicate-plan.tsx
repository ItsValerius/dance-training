"use client";

import { Copy } from "lucide-react";
import { duplicatePlan } from "@/app/(app)/trainer/actions";
import { ActionForm } from "@/components/action-form";
import { PlanFields } from "@/components/plan-fields";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/** "Duplizieren" button + dialog for a new title and due date; the action redirects to the copy. */
export function DuplicatePlan({ plan }: { plan: { id: string; title: string } }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="icon" aria-label={`„${plan.title}“ duplizieren`} title="Duplizieren" />}>
        <Copy aria-hidden />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>„{plan.title}“ duplizieren</DialogTitle>
          <DialogDescription>Mit Übungen und Zuweisungen, ohne Fortschritt.</DialogDescription>
        </DialogHeader>
        <ActionForm action={duplicatePlan.bind(null, plan.id)} className="grid gap-3">
          <PlanFields id={`copy-${plan.id}`} defaults={{ title: plan.title }} />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Abbrechen</DialogClose>
            <Button type="submit">Kopie anlegen</Button>
          </DialogFooter>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}
