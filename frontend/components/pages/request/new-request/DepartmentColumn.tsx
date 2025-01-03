"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRequest } from "@/context/RequestContext";
import SelectionActions from "./SelectionActions";

export default function DepartmentColumn() {
  const { departments, selectedDepartments, setSelectedDepartments } =
    useRequest();
  const [filteredDepartments, setFilteredDepartments] = useState(departments);
  const [search, setSearch] = useState("");

  // Filter departments based on search
  useEffect(() => {
    setFilteredDepartments(
      departments.filter((dept) =>
        dept.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, departments]);

  // Add all departments to selected
  const selectAll = () => {
    const allIds = filteredDepartments.map((dept) => dept.id.toString());
    setSelectedDepartments(allIds);
  };

  // Remove all selected departments
  const removeAll = () => {
    setSelectedDepartments([]);
  };

  return (
    <div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Department List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <Input
            type="text"
            placeholder="Search Departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          {/* Selection Actions */}
          <SelectionActions onAddAll={selectAll} onRemoveAll={removeAll} />

          {/* Department List */}
          <ScrollArea
            className="overflow-y-auto border rounded-lg p-2 bg-gray-50"
            style={{
              height: "100%",
              maxHeight: "calc(100vh - 200px)",
            }}
          >
            {filteredDepartments.length === 0 ? (
              <p className="text-gray-500 text-center">No departments found.</p>
            ) : (
              filteredDepartments.map((dept) => (
                <label
                  key={dept.id}
                  className={`block border rounded-lg p-4 cursor-pointer ${
                    selectedDepartments.includes(dept.id.toString())
                      ? "bg-blue-50 border-blue-500"
                      : "bg-white border-gray-300"
                  }`}
                  onClick={() =>
                    setSelectedDepartments((prev) =>
                      prev.includes(dept.id.toString())
                        ? prev.filter((id) => id !== dept.id.toString())
                        : [...prev, dept.id.toString()]
                    )
                  }
                >
                  <span className="text-sm text-gray-700">{dept.name}</span>
                </label>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
