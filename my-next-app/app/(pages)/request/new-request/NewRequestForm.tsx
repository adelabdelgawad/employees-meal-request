"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useState } from "react";

// Reusable SelectableList component
interface SelectableListProps<T> {
  items: T[];
  selectedItems: Set<string>;
  onSelectionChange: (newSelectedItems: Set<string>) => void;
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => JSX.Element;
  filterFunction: (item: T, searchTerm: string) => boolean;
}

function SelectableList<T>({
  items,
  selectedItems,
  onSelectionChange,
  keyExtractor,
  renderItem,
  filterFunction,
}: SelectableListProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter((item) => filterFunction(item, searchTerm));

  const handleSelectAll = () => {
    const newSelectedItems = new Set([
      ...selectedItems,
      ...filteredItems.map(keyExtractor),
    ]);
    onSelectionChange(newSelectedItems);
  };

  const handleDeselectAll = () => {
    const filteredKeys = new Set(filteredItems.map(keyExtractor));
    const newSelectedItems = new Set(
      [...selectedItems].filter((key) => !filteredKeys.has(key))
    );
    onSelectionChange(newSelectedItems);
  };

  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                         />
    <div className="flex justify-between mb-4">        
        {/* Add All Button */}
        <Button onClick={handleSelectAll} variant="outline">
        <PlusCircle className="h-5 w-5" />
        Add All        </Button>
        <Button onClick={handleDeselectAll} variant="outline">
        <MinusCircle className="h-5 w-5" />
        Remove All        </Button>
      </div>
      <div className=" overflow-y-auto">
        {filteredItems.map((item) => {
          const key = keyExtractor(item);
          const isSelected = selectedItems.has(key);
          return (
            <div key={key} className="flex items-center py-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => {
                  const newSelectedItems = new Set(selectedItems);
                  if (checked) {
                    newSelectedItems.add(key);
                  } else {
                    newSelectedItems.delete(key);
                  }
                  onSelectionChange(newSelectedItems);
                }}
              />
              <div className="ml-2">{renderItem(item)}</div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// Main component

interface NewRequestFormProps {
  userData: NewRequestDataResponse
}

export default function NewRequestForm({
  userData
}: NewRequestFormProps) {
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(new Set());
  const [checkedEmployees, setCheckedEmployees] = useState<Set<string>>(new Set());
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);

  // Extract departments and employees
  const departments = userData.departments.map((dept) => dept.department);
  const employeesToShow = userData.departments
    .filter((dept) => selectedDepartments.has(dept.department))
    .flatMap((dept) => dept.employees);

  const addSelectedEmployees = () => {
    const employeesToAdd = employeesToShow.filter((emp) =>
      checkedEmployees.has(emp.code.toString())
    );
    const newSelectedEmployees = [
      ...selectedEmployees,
      ...employeesToAdd.filter(
        (emp) => !selectedEmployees.some((e) => e.code === emp.code)
      ),
    ];
    setSelectedEmployees(newSelectedEmployees);
    setCheckedEmployees(new Set()); // Reset checked employees
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50  p-2">      {/* Grid container with remaining space and scrolling */}
      <div className="grid grid-cols-1   gap-6 flex-1">
        <div className="container mx-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {/* Department Column */}
            <div className="border p-4 rounded-lg flex flex-col h-full">
              <h2 className="text-lg font-semibold mb-2">Departments</h2>
              <div className="flex-grow overflow-y-auto">
                <SelectableList
                  items={departments}
                  selectedItems={selectedDepartments}
                  onSelectionChange={setSelectedDepartments}
                  keyExtractor={(dept) => dept}
                  renderItem={(dept) => <span>{dept}</span>}
                  filterFunction={(dept, searchTerm) =>
                    dept.toLowerCase().includes(searchTerm.toLowerCase())
                  }
                />
              </div>
            </div>

            {/* Employee Column */}
            <div className="border p-4 rounded-lg flex flex-col h-full">
              <h2 className="text-lg font-semibold mb-2">Employees</h2>
              <div className="flex-grow overflow-y-auto">
                <SelectableList
                  items={employeesToShow}
                  selectedItems={checkedEmployees}
                  onSelectionChange={setCheckedEmployees}
                  keyExtractor={(emp) => emp.code}
                  renderItem={(emp) => (
                    <div>
                      {emp.code} - {emp.name} ({emp.title})
                    </div>
                  )}
                  filterFunction={(emp, searchTerm) =>
                    emp.code.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
                  }
                />
              </div>
              <Button
                onClick={addSelectedEmployees}
                className="mt-4"
                disabled={checkedEmployees.size === 0}
              >
                Add Selected Employees
              </Button>
            </div>

            {/* Selected Employees Column */}
            <div className="border p-4 rounded-lg flex flex-col h-full">
              <h2 className="text-lg font-semibold mb-2">Selected Employees</h2>
              <div className="flex-grow overflow-y-auto">
                {selectedEmployees.length === 0 ? (
                  <p className="text-gray-500">No employees selected.</p>
                ) : (
                  selectedEmployees.map((emp) => (
                    <div key={emp.code} className="py-1">
                      {emp.code} - {emp.name} ({emp.title})
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button at the Bottom */}
      <div className="p-4 gap">
        <Button>Submit</Button>
      </div>
    </div>
  );
}