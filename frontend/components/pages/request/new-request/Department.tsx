"use client";

import { useEffect, useState, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { DepartmentType } from "@/lib/definitions";
import { fetchDepartments } from "@/api/department";

interface DepartmentProps {
  selectedDepartments: string[];
  setSelectedDepartments: React.Dispatch<React.SetStateAction<string[]>>;
}

function DepartmentList({
  filteredDepartments,
  selectedDepartments,
  toggleDepartment,
}: {
  filteredDepartments: DepartmentType[];
  selectedDepartments: string[];
  toggleDepartment: (deptId: string) => void;
}) {
  return filteredDepartments.length === 0 ? (
    <p className="text-gray-500 text-center">No Departments found.</p>
  ) : (
    <div className="space-y-1">
      {filteredDepartments.map((dept) => (
        <label
          key={dept.id}
          className={`block border rounded-lg p-4 cursor-pointer ${
            selectedDepartments.includes(dept.id.toString())
              ? "bg-blue-50 border-blue-500"
              : "bg-white border-gray-300"
          }`}
          onClick={() => toggleDepartment(dept.id.toString())}
        >
          <span className="text-sm text-gray-700">{dept.name}</span>
        </label>
      ))}
    </div>
  );
}

export default function Department({
  selectedDepartments,
  setSelectedDepartments,
}: DepartmentProps) {
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<
    DepartmentType[]
  >([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Reset error state on each fetch attempt
      try {
        const data = await fetchDepartments();
        setDepartments(data);
        setFilteredDepartments(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred while fetching employees.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setFilteredDepartments(
      departments.filter((dept) =>
        dept.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, departments]);

  const toggleDepartment = (deptId: string) => {
    const updated = selectedDepartments.includes(deptId)
      ? selectedDepartments.filter((id) => id !== deptId)
      : [...selectedDepartments, deptId];
    setSelectedDepartments(updated);
  };

  const selectAll = () => {
    const allIds = departments.map((dept) => dept.id.toString());
    setSelectedDepartments(allIds);
  };

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

          {/* Actions */}
          <div className="flex justify-between mb-4">
            <Button variant="outline" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" onClick={removeAll}>
              Remove All
            </Button>
          </div>

          {/* Department List */}
          <ScrollArea
            className="overflow-y-auto border rounded-lg p-2 bg-gray-50"
            style={{
              height: "100%",
              maxHeight: "calc(100vh - 200px)",
            }}
          >
            <Suspense
              fallback={
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-md" />
                  ))}
                </div>
              }
            >
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-md" />
                  ))}
                </div>
              ) : error ? (
                <p className="text-red-500 text-center">Error: {error}</p>
              ) : (
                <DepartmentList
                  filteredDepartments={filteredDepartments}
                  selectedDepartments={selectedDepartments}
                  toggleDepartment={toggleDepartment}
                />
              )}
            </Suspense>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
