"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Actions from "./Actions";

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  fullName?: string;
  username?: string;
  title?: string;
  roles?: Role[];
}

const DataTable = ({ initialData }: { initialData: User[] }) => {
  const [data, setData] = useState<User[]>(initialData);

  useEffect(() => setData(initialData), [initialData]);

  return (
    <div className="relative overflow-x-auto border border-neutral-200 bg-white">
      <Table className="w-full text-sm text-neutral-700 whitespace-nowrap text-center">
        <TableHeader className="bg-neutral-100 text-xs font-semibold uppercase text-neutral-600">
          <TableRow>
            <TableHead className="text-center">Display Name</TableHead>
            <TableHead className="text-center">Username</TableHead>
            <TableHead className="text-center">Title</TableHead>
            <TableHead className="text-center">Roles</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((record) => (
              <TableRow className="text-center" key={record.id}>
                <TableCell className="text-center">
                  {record.fullName ?? "-"}
                </TableCell>
                <TableCell className="text-center">
                  {record.username ?? "-"}
                </TableCell>
                <TableCell className="text-center">
                  {record.title ?? "-"}
                </TableCell>
                <TableCell className="text-center">
                  {record.roles
                    ? record.roles.map((role) => role.name).join(", ")
                    : "-"}
                </TableCell>
                <TableCell className="text-center">
                  <Actions userId={record.id} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
