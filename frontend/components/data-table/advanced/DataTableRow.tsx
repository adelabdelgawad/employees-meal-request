import React from "react";
import { Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Person } from "@/types";

interface DataTableRowProps {
  row: Row<Person>;
}

const DataTableRow: React.FC<DataTableRowProps> = ({ row }) => {
  return (
    <tr key={row.id} className="border-b">
      <td>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </td>
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id} className="px-4 py-2">
          {cell.getValue() as React.ReactNode}
        </td>
      ))}
    </tr>
  );
};

export default DataTableRow;
