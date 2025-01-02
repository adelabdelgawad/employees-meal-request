"use client";

import { useState, useEffect } from "react";

interface Employee {
    code: string;
    name: string;
    department: string;
    title: string;
}

interface MealTypes {
    lunch: boolean;
    dinner: boolean;
}

interface EmployeeWithDetails extends Employee {
    note: string;
    mealTypes: MealTypes;
}

interface EmployeeListClientProps {
    departmentData: Record<string, Employee[]>;
    selectedDepartments: string[];
    selectedEmployees: EmployeeWithDetails[];
    onEmployeeSelectionChange: (selectedEmployees: EmployeeWithDetails[]) => void;
    addAlert: (message: string, type?: "success" | "warning" | "error") => void; // New prop
}

export default function EmployeeListClient({
    departmentData,
    selectedDepartments,
    selectedEmployees,
    onEmployeeSelectionChange,
    addAlert, // Receive addAlert from props
}: EmployeeListClientProps) {
    const [visibleEmployees, setVisibleEmployees] = useState<Employee[]>([]);
    const [search, setSearch] = useState("");
    const [highlightedEmployees, setHighlightedEmployees] = useState<Set<string>>(new Set());
    const [mealTypes, setMealTypes] = useState<MealTypes>({ dinner: false, lunch: false });
    const [note, setNote] = useState<string>("");

    useEffect(() => {
        const employees = selectedDepartments.flatMap((dept) => departmentData[dept] || []);
        const filteredEmployees = employees.filter((emp) => !selectedEmployees.some((e) => e.code === emp.code));
        setVisibleEmployees(filteredEmployees);
    }, [selectedDepartments, departmentData, selectedEmployees]);

    const toggleEmployeeHighlight = (employeeCode: string) => {
        setHighlightedEmployees((prev) => {
            const updated = new Set(prev);
            if (updated.has(employeeCode)) {
                updated.delete(employeeCode);
            } else {
                updated.add(employeeCode);
            }
            return updated;
        });
    };

    const handleAddSelected = () => {
        if (!mealTypes.lunch && !mealTypes.dinner) {
            addAlert("Please select at least one meal type (Lunch or Dinner) before adding employees.", "warning");
            return;
        }

        const newSelections: EmployeeWithDetails[] = [];
        highlightedEmployees.forEach((empCode) => {
            const employee = visibleEmployees.find((emp) => emp.code === empCode);
            if (employee) {
                if (mealTypes.lunch) {
                    newSelections.push({
                        ...employee,
                        note,
                        mealTypes: { lunch: true, dinner: false },
                    });
                }
                if (mealTypes.dinner) {
                    newSelections.push({
                        ...employee,
                        note,
                        mealTypes: { lunch: false, dinner: true },
                    });
                }
            }
        });

        onEmployeeSelectionChange([...selectedEmployees, ...newSelections]);
        setHighlightedEmployees(new Set());
    };

    const handleMealTypeChange = (mealType: "dinner" | "lunch") => {
        setMealTypes((prev) => ({ ...prev, [mealType]: !prev[mealType] }));
    };

    const filteredEmployees = search
        ? visibleEmployees.filter(
            (emp) =>
                emp.code.toString().includes(search) ||
                emp.name.toLowerCase().includes(search.toLowerCase())
        )
        : visibleEmployees;

    return (
        <div className="flex flex-col h-full">
            <input
                type="text"
                placeholder="Search Employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full mb-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div
                className="border rounded-lg p-2 flex-1 overflow-y-auto"
                style={{
                    minHeight: "150px",
                    maxHeight: "calc(100vh - 150px)",
                }}
            >
                {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                        <div
                            key={employee.code}
                            onClick={() => toggleEmployeeHighlight(employee.code)}
                            className={`p-2 rounded-lg shadow-sm flex justify-between items-center mb-2 cursor-pointer ${highlightedEmployees.has(employee.code)
                                    ? "bg-yellow-300"
                                    : "bg-gray-100"
                                }`}
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-sm font-semibold">{employee.name}</span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {employee.department} - {employee.title}
                                    </div>
                                </div>

                                <div className="text-left">
                                    <span className="text-xs text-gray-500 font-bold">{employee.code}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center">No employees found</p>
                )}
            </div>

            <div className="mt-4">
                <div className="flex gap-2 mb-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={mealTypes.lunch}
                            onChange={() => handleMealTypeChange("lunch")}
                            className="mr-2 w-4 h-4 text-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm">Lunch</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={mealTypes.dinner}
                            onChange={() => handleMealTypeChange("dinner")}
                            className="mr-2 w-4 h-4 text-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm">Dinner</span>
                    </label>
                </div>

                <div className="flex gap-1">
                    <div className="mb-4 flex-1">
                        <input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Enter a global note for all employees..."
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <button
                            onClick={handleAddSelected}
                            className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full"
                            disabled={highlightedEmployees.size === 0}
                        >
                            Add Selected
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

