"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import RequestLinesTable from "./RequestLinesTable";
import toast from "react-hot-toast";
import ConfirmationDialog from "@/components/confirmation-dialog";

interface RequestLinesSheetProps {
  record: RequestRecord;
  disabled: boolean;
  onSave: (deletedLines: RequestLine[]) => void;
  onClose: () => void;
}

const RequestLinesSheet: React.FC<RequestLinesSheetProps> = ({
  record,
  disabled,
  onSave,
  onClose,
}) => {
  const [requestLines, setRequestLines] = useState<RequestLine[]>([]);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const handleDelete = (id: number) => {
    setRequestLines((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_deleted: true } : p))
    );
    toast.success("RequestLine marked for deletion");
  };

  const handleUndo = (id: number) => {
    setRequestLines((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_deleted: false } : p))
    );
    toast.success("RequestLine restored");
  };

  const handleSave = () => {
    const deletedRequestLines = requestLines.filter((p) => p.is_deleted);
    if (deletedRequestLines.length > 0) {
      setShowSaveConfirmation(true);
    } else {
      onSave([]);
      onClose();
    }
  };

  const confirmSave = () => {
    const deletedRequestLines = requestLines.filter((p) => p.is_deleted);
    onSave(deletedRequestLines);
    setShowSaveConfirmation(false);
    onClose();
  };
  const handleCancel = () => {
    onClose();
  };

  return (
    <>
      <Sheet open onOpenChange={onClose}>
        <SheetContent className="sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle>RequestLine List</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <RequestLinesTable
              disabled={disabled}
              requestId={record.id}
              onDelete={handleDelete}
              onUndo={handleUndo}
            />
          </div>
          <SheetFooter className="gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmationDialog
        isOpen={showSaveConfirmation}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete ${
          requestLines.filter((p) => p.is_deleted).length
        } requestLine(s)?`}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={confirmSave}
        onCancel={() => setShowSaveConfirmation(false)}
        confirmButtonVariant="destructive"
      />
    </>
  );
};

export default RequestLinesSheet;
