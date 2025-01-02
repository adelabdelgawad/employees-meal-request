"use client";

import { useState } from "react";

interface DepartmentListClientProps {
  departments: string[];
  onDepartmentChange: (selectedDepartments: string[]) => void;
}

export default function DepartmentListClient({ departments, onDepartmentChange }: DepartmentListClientProps) {
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
    <div className="flex flex-col border border-gray-300 rounded-lg shadow-sm bg-gray-100 p-4 flex-grow">
      <input
        type="text"
        placeholder="Search Departments..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex justify-between mb-2">
        <button onClick={selectAll} className="text-blue-500">Select All</button>
        <button onClick={removeAll} className="text-red-500">Remove All</button>
      </div>
      <div
        className="overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-200 flex-grow"
        style={{
          height: "100%",
          maxHeight: "calc(100vh - 150px)",
        }}
      >
        <ul>
          {filteredDepartments.map((dept) => (

            <li key={dept} className="mb-2">
              <label className="bg-gray-100 p-2 rounded-lg shadow-sm flex gap-3">
                <input
                  type="checkbox"
                  checked={selectedDepartments.includes(dept)}
                  onChange={() => toggleDepartment(dept)}
                />
                <span>{dept}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
