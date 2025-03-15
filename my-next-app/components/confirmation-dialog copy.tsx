


"use client";

import React, { useId } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmationDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  // Generate unique IDs for the title and description
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent aria-labelledby={titleId} aria-describedby={descriptionId}>
        <DialogTitle id={titleId}>{title}</DialogTitle>
        <DialogDescription id={descriptionId}>
          {message || " "}
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={confirmButtonVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
