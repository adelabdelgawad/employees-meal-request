"use client";

interface SelectedEmployeesProps {
  selectedEmployees: any[]; // Holds full employee details for each meal type (lunch/dinner)
  onRemoveEmployee: (employeeCode: string, mealType: string) => void; // Callback to remove an employee
}

export default function SelectedEmployees({ selectedEmployees, onRemoveEmployee }: SelectedEmployeesProps) {
  return (
    <div className="border rounded-lg p-2 flex-1 overflow-y-auto" style={{ minHeight: "150px" }}>
      {selectedEmployees.length > 0 ? (
        <ul>
          {selectedEmployees.map((employee, index) => (
            <li key={`${employee.code}-${employee.mealTypes.lunch ? 'lunch' : 'dinner'}-${index}`} className="mb-2">
              <div className="flex justify-between bg-gray-100 p-2 rounded-lg shadow-sm">
                <div className="flex flex-col">
                  <div className="text-sm font-semibold">{employee.name}</div>
                  <div className="text-xs text-gray-500">{employee.department} - {employee.title}</div>
                  <div className="flex gap-2">
                    <div className="text-xs text-gray-500 italic">Code: {employee.code}</div>
                    <div className="text-xs text-gray-500">
                      Meal Type: {employee.mealTypes.lunch ? "Lunch" : ""} {employee.mealTypes.dinner ? "Dinner" : ""}
                    </div>
                    <div className="text-xs text-gray-500">Note: {employee.note}</div>
                  </div>
                </div>
                {/* Simple Remove "X" Button */}
                <button
                  onClick={() => onRemoveEmployee(employee.code, employee.mealTypes.lunch ? "lunch" : "dinner")}
                  className="text-red-500 hover:text-red-600 text-lg font-bold px-2 rounded-full transition-all"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center">No employees selected</p>
      )}
    </div>
  );
}
