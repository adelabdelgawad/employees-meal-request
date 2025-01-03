"use client";

import { Button } from "@/components/ui/button";
import { PlusCircleIcon, MinusCircleIcon } from "@heroicons/react/24/outline";

interface SelectionActionsProps {
  onAddAll: () => void;
  onRemoveAll: () => void;
}

export default function SelectionActions({
  onAddAll,
  onRemoveAll,
}: SelectionActionsProps) {
  return (
    <div className="flex justify-between mb-4">
      <Button
        variant="outline"
        onClick={onAddAll}
        className="flex items-center gap-2"
      >
        <PlusCircleIcon className="h-5 w-5" />
        Add All
      </Button>
      <Button
        variant="outline"
        onClick={onRemoveAll}
        className="flex items-center gap-2"
      >
        <MinusCircleIcon className="h-5 w-5" />
        Remove All
      </Button>
    </div>
  );
}
