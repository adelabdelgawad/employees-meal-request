"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import RequestLinesTable from "./RequestLinesTable";
import toast from "react-hot-toast";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { getRequestLines } from "@/app/actions/request-lines";

interface RequestLinesSheetProps {
  record: RequestRecord;
  disabled: boolean;
  onSave: (deletedLines: RequestLine[]) => Promise<void>;
  onClose: () => void;
}

export default function RequestLinesSheet({
  record,
  disabled,
  onSave,
  onClose,
}: RequestLinesSheetProps) {
  const [requestLines, setRequestLines] = useState<RequestLine[]>([]);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchRequestLines = async () => {
      try {
        setIsLoading(true);
        const response = await getRequestLines(record.id);
        setRequestLines(
          response.map((line: RequestLine) => ({
            ...line,
            is_deleted: line.is_deleted || false, // Ensure is_deleted is always defined
          }))
        );
      } catch (error) {
        toast.error("Failed to load request lines");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequestLines();
  }, [record.id]);

  const handleDelete = (id: number) => {
    setRequestLines((prev) =>
      prev.map((line) =>
        line.id === id ? { ...line, is_deleted: true } : line
      )
    );
    toast.success("Request line marked for deletion");
  };

  const handleUndo = (id: number) => {
    setRequestLines((prev) =>
      prev.map((line) =>
        line.id === id ? { ...line, is_deleted: false } : line
      )
    );
    toast.success("Request line restored");
  };

  const handleSave = async () => {
    const deletedLines = requestLines.filter((line) => line.is_deleted);
    if (deletedLines.length > 0) {
      setShowSaveConfirmation(true);
    } else {
      try {
        await onSave([]);
        onClose();
      } catch (error) {
        console.error("Error while saving changes", error);
        toast.error("Failed to save changes");
      }
    }
  };

  const confirmSave = async () => {
    const deletedLines = requestLines.filter((line) => line.is_deleted);
    try {
      await onSave(deletedLines);
      setShowSaveConfirmation(false);
      onClose();
    } catch (error) {
      console.error("Error while saving changes", error);
      toast.error("Failed to save changes");
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <>
      <Sheet open onOpenChange={onClose}>
        <SheetContent className="sm:max-w-[900px]">
          <SheetHeader>
            <SheetTitle>Request Line List</SheetTitle>
            <SheetDescription>Manage Request Lines</SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <RequestLinesTable
              disabled={disabled}
              onDelete={handleDelete}
              onUndo={handleUndo}
              initialRequestLines={requestLines}
              loading={isLoading}
            />
          </div>
          <SheetFooter className="gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={disabled}>
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmationDialog
        isOpen={showSaveConfirmation}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete ${requestLines.filter(
          (line) => line.is_deleted
        ).length} request line(s)?`}
        onConfirm={confirmSave}
        onCancel={() => setShowSaveConfirmation(false)}
      />
    </>
  );
}
