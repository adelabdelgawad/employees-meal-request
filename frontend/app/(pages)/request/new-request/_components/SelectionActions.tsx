"use client";

import { PlusCircleIcon, MinusCircleIcon } from "@heroicons/react/24/outline";

interface SelectionActionsProps {
  onAddAll: () => void;
  onRemoveAll: () => void;
  disableAddAll: boolean;
  disableRemoveAll: boolean;
}

export default function SelectionActions({
  onAddAll,
  onRemoveAll,
  disableAddAll,
  disableRemoveAll,
}: SelectionActionsProps) {
  return (
    <div className="flex justify-between mb-4">
      <button
        onClick={onAddAll}
        className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium ${
          disableAddAll
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
        }`}
        disabled={disableAddAll}
      >
        <PlusCircleIcon className="h-5 w-5" />
        Add All
      </button>
      <button
        onClick={onRemoveAll}
        className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium ${
          disableRemoveAll
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white text-red-600 border-red-600 hover:bg-red-50"
        }`}
        disabled={disableRemoveAll}
      >
        <MinusCircleIcon className="h-5 w-5" />
        Remove All
      </button>
    </div>
  );
}
