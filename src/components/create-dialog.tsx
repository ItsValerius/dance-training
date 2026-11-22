"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { ActionForm, type ActionResult } from "@/components/action-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

/** "+ <label>" button opening a dialog with a create form; closes on success (redirecting actions just navigate away). */
export function CreateDialog({
  label,
  title,
  description,
  submitLabel = "Anlegen",
  action,
  children,
}: {
  label: string;
  title: string;
  description?: string;
  submitLabel?: string;
  action: (prev: ActionResult, data: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="shrink-0" />}>
        <Plus aria-hidden />
        {label}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <ActionForm action={action} onSuccess={() => setOpen(false)} className="grid gap-3">
          {children}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Abbrechen</DialogClose>
            <Button type="submit">{submitLabel}</Button>
          </DialogFooter>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}
