"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Actions from "./_actions/Actions";
import { useState } from "react";




interface HistoryDataTableProps {
  initialData: HistoryRequest[];
}

const HistoryDataTable: React.FC<HistoryDataTableProps> = ({ initialData }) => {
  const [data, setData] = useState<HistoryRequest[]>(initialData);

  return (
    <div className="relative overflow-x-auto border border-neutral-200 bg-white">
      <Table className="w-full text-sm text-neutral-700 whitespace-nowrap">
        <TableHeader className="bg-neutral-100 text-xs font-semibold uppercase text-neutral-600">
          <TableRow>
            <TableHead className="text-center align-middle px-4 py-2 ">
              Request Time
            </TableHead>
            <TableHead className="text-center align-middle px-4 py-2 ">
              Meal
            </TableHead>
            <TableHead className="text-center align-middle px-4 py-2 ">
              Status
            </TableHead>
            <TableHead className="text-center align-middle px-4 py-2 ">
              Closed Time
            </TableHead>
            <TableHead className="text-center align-middle px-4 py-2 ">
              Requests
            </TableHead>
            <TableHead className="text-center align-middle px-4 py-2 ">
              Accepted
            </TableHead>
            <TableHead className="text-center align-middle px-4 py-2 ">
              Notes
            </TableHead>
            <TableHead className="text-center align-middle px-4 py-2 ">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="text-center align-middle px-4 py-2 ">
                  {record.request_time?.replace("T", " ") ?? "-"}
                </TableCell>
                <TableCell className="text-center align-middle px-4 py-2 ">
                  {record.meal ?? "-"}
                </TableCell>
                <TableCell className="text-center align-middle px-4 py-2 ">
                  {record.status_name ?? "-"}
                </TableCell>
                <TableCell className="text-center align-middle px-4 py-2 ">
                  {record.closed_time?.replace("T", " ") ?? "-"}
                </TableCell>
                <TableCell className="text-center align-middle px-4 py-2 ">
                  {record.total_lines ?? "-"}
                </TableCell>
                <TableCell className="text-center align-middle px-4 py-2 ">
                  {record.accepted_lines ?? "-"}
                </TableCell>
                <TableCell className="text-center align-middle px-4 py-2 ">
                  {record.notes ?? "-"}
                </TableCell>
                <TableCell className="text-center align-middle px-4 py-2 ">
                  <Actions
                    recordId={record.id}
                    currentStatusId={record.status_id ?? 0}
                    setData={setData} // 🛑 Pass the state setter function
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center">
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default HistoryDataTable;
