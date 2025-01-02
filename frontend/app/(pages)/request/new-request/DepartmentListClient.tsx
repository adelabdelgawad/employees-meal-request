"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input"; // ShadCN Input component
import { Button } from "@/components/ui/button"; // ShadCN Button component
import { Checkbox } from "@/components/ui/checkbox"; // ShadCN Checkbox component

interface DepartmentListClientProps {
  departments: string[];
  onDepartmentChange: (selectedDepartments: string[]) => void;
}

export default function DepartmentListClient({
  departments,
  onDepartmentChange,
}: DepartmentListClientProps) {
  const [search, setSearch] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const filteredDepartments = departments.filter((dept) =>
    dept.toLowerCase().includes(search.toLowerCase())
  );

  const toggleDepartment = (dept: string) => {
    const updated = selectedDepartments.includes(dept)
      ? selectedDepartments.filter((d) => d !== dept)
      : [...selectedDepartments, dept];
    setSelectedDepartments(updated);
    onDepartmentChange(updated);
  };

  const selectAll = () => {
    setSelectedDepartments(departments);
    onDepartmentChange(departments);
  };

  const removeAll = () => {
    setSelectedDepartments([]);
    onDepartmentChange([]);
  };

  return (
    <div className="flex flex-col border rounded-lg shadow bg-white p-4">
      {/* Search Input */}
      <Input
        type="text"
        placeholder="Search Departments..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      {/* Actions */}
      <div className="flex justify-between mb-4">
        <Button variant="link" onClick={selectAll}>
          Select All
        </Button>
        <Button variant="link" onClick={removeAll}>
          Remove All
        </Button>
      </div>

      {/* Department List */}
      <div
        className="overflow-y-auto border rounded-lg p-2 bg-gray-50"
        style={{
          height: "100%",
          maxHeight: "calc(100vh - 200px)",
        }}
      >
        <ul className="space-y-2">
          {filteredDepartments.map((dept) => (
            <li key={dept}>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={selectedDepartments.includes(dept)}
                  onCheckedChange={() => toggleDepartment(dept)}
                />
                <span className="text-sm text-gray-700">{dept}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
