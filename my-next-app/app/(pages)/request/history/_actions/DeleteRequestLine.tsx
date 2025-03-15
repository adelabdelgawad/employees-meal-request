"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Trash, Undo } from "lucide-react";


interface DeleteRequestLineProps {
  requestLine: RequestLine;
  disabled: boolean;
  onDelete: (id: number) => void;
  onUndo: (id: number) => void;
}

export default function DeleteRequestLine({
  requestLine,
  disabled,
  onDelete,
  onUndo,
}: DeleteRequestLineProps) {
  return (
    <>
      {requestLine.is_deleted ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUndo(requestLine.id)}
        >
          <Undo className="h-4 w-4 mr-2" />
          Undo
        </Button>
      ) : (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(requestLine.id)}
          disabled={disabled}
        >
          <Trash size={20} />
        </Button>
      )}
    </>
  );
}