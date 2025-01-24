import React from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

interface DepartmentItemProps {
  dept: { id: string; name: string };
  isSelected: boolean;
  onToggle: (deptId: string) => void;
}

const DepartmentItem: React.FC<DepartmentItemProps> = ({
  dept,
  isSelected,
  onToggle,
}) => {
  return (
    <div
      onClick={() => onToggle(dept.id.toString())}
      className={`flex items-center justify-between border rounded-lg p-3 my-2 cursor-pointer ${
        isSelected ? "bg-blue-50 border-blue-500" : "bg-white border-gray-300"
      }`}
    >
      <span className="text-sm font-medium">{dept.name}</span>
      <Checkbox.Root
        checked={isSelected}
        onCheckedChange={() => onToggle(dept.id.toString())}
        className="w-5 h-5 border rounded flex items-center justify-center"
      >
        <Checkbox.Indicator>
          <CheckIcon className="w-4 h-4 text-blue-500" />
        </Checkbox.Indicator>
      </Checkbox.Root>
    </div>
  );
};

export default DepartmentItem;
