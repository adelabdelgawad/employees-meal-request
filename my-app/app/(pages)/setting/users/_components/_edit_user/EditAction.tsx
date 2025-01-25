import { Pencil } from "lucide-react";
import React from "react";

function EditAction() {
  return (
    <div className="flex gap-2 items-center">
      <Pencil className="w-5 h-5 text-blue-600 hover:text-blue-700 cursor-pointer" />
      <span className="selectable-text cursor-pointer">Edit</span>
    </div>
  );
}

export default EditAction;
