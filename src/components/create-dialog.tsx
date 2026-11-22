"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "cn";
import { ActionForm, type ActionResult } from "@/components/action-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

/** "+ <label>" button opening a dialog with a form (create, or edit with `icon`/`variant`); closes on success (redirecting actions just navigate away). */
export function CreateDialog({
  label,
  title,
  description,
  submitLabel = "Anlegen",
  icon = <Plus aria-hidden />,
  variant,
  compact = false,
  action,
  children,
}: {
  label: string;
  title: string;
  description?: string;
  submitLabel?: string;
  /** trigger icon element (a component can't cross from server pages into this client component) */
  icon?: React.ReactNode;
  variant?: "outline";
  /** icon-only trigger on phones, so it fits beside a page heading */
  compact?: boolean;
  action: (prev: ActionResult, data: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={variant} className={cn("shrink-0", compact && "max-sm:w-11 max-sm:px-0")} />}>
        {icon}
        <span className={cn(compact && "max-sm:sr-only")}>{label}</span>
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
