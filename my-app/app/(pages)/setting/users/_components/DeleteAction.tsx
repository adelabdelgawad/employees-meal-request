import { Trash2 } from "lucide-react";
import React from "react";

function DeleteAction() {
  return (
    <div className="flex gap-2 items-center">
      <Trash2 className="w-5 h-5 text-red-600 hover:text-red-700 cursor-pointer" />
      <span className="selectable-text cursor-pointer">Delete</span>
    </div>
  );
}

export default DeleteAction;
