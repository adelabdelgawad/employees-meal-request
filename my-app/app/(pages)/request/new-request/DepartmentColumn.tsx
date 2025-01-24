'use client';
import { useState, useMemo } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import DepartmentItem from './_components/DepartmentItem';
import { useNewRequest } from '@/hooks/NewRequestContext';
import SelectionActions from './_components/SelectionActions';
import DepartmentsFilter from './_components/DepartmentsFilter';

export default function DepartmentColumn() {
  const { departments, selectedDepartments, setSelectedDepartments } =
    useNewRequest();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [departments, searchTerm]);

  const selectedSet = useMemo(
    () => new Set(selectedDepartments),
    [selectedDepartments],
  );

  const toggleDepartment = (deptId: string) => {
    setSelectedDepartments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deptId)) {
        newSet.delete(deptId);
      } else {
        newSet.add(deptId);
      }
      return Array.from(newSet);
    });
  };

  const addAllDepartments = () => {
    setSelectedDepartments(
      filteredDepartments.map((dept) => dept.id.toString()),
    );
  };

  const removeAllDepartments = () => {
    setSelectedDepartments([]);
  };

  return (
    <div className="flex flex-col h-full border rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">Department List</h2>

      <div className="mb-4">
        <DepartmentsFilter
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          placeholder="Search Departments..."
        />
      </div>

      <div className="mb-4">
        <SelectionActions
          onAddAll={addAllDepartments}
          onRemoveAll={removeAllDepartments}
          disableAddAll={
            filteredDepartments.length === selectedDepartments.length
          }
          disableRemoveAll={selectedDepartments.length === 0}
        />
      </div>

      <div className="flex-1 overflow-hidden flex items-center justify-center">
        {filteredDepartments.length > 0 ? (
          <ScrollArea.Root className="h-full w-full overflow-hidden">
            <ScrollArea.Viewport className="h-full w-full">
              {filteredDepartments.map((dept) => (
                <DepartmentItem
                  key={dept.id}
                  dept={dept}
                  isSelected={selectedSet.has(dept.id.toString())}
                  onToggle={toggleDepartment}
                />
              ))}
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              orientation="vertical"
              className="w-2 bg-gray-200"
            >
              <ScrollArea.Thumb className="bg-gray-400 rounded" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full text-gray-500">
            <p className="text-sm font-medium">No departments found</p>
          </div>
        )}
      </div>
    </div>
  );
}
