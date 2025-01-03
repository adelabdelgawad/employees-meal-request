import { FC, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MealTypeOption from "./MealTypeOption";
import { Input } from "@/components/ui/input";
import { EmployeeType, MealType } from "@/lib/definitions";

interface EmployeeDialogProps {
  selectedEmployees: EmployeeType[];
  mealTypes: MealType[];
  onSelectMealType: (selectedMealTypes: MealType[]) => void;
}

const EmployeesSelectionDialog: FC<EmployeeDialogProps> = ({
  selectedEmployees,
  mealTypes,
  onSelectMealType,
}) => {
  const [employeeNotes, setEmployeeNotes] = useState<Record<number, string>>(
    {}
  );
  const [selectedMealTypes, setSelectedMealTypes] = useState<MealType[]>([]);

  // Handle notes input change
  const handleNoteChange = (employeeId: number, note: string) => {
    setEmployeeNotes((prev) => ({
      ...prev,
      [employeeId]: note,
    }));
  };

  // Handle meal type selection
  const handleMealTypeChange = (selectedMealTypes: MealType[]) => {
    setSelectedMealTypes(selectedMealTypes);
    onSelectMealType(selectedMealTypes);
  };

  // Handle form submission
  const handleSubmit = () => {
    const finalData = selectedEmployees.flatMap((employee) =>
      selectedMealTypes.map((mealType) => ({
        id: employee.id,
        name: employee.name,
        department_id: employee.department_id,
        meal_id: mealType.id,
        meal_name: mealType.name,
        notes: employeeNotes[employee.id] || "",
      }))
    );

    console.log("Submitted Data:", finalData);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full p-2 mt-2 bg-green-600 text-white hover:bg-green-700">
          Submit Requested
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="items-center">
          <DialogTitle>Selected Employees</DialogTitle>
        </DialogHeader>

        {/* Meal Type Selection */}
        <MealTypeOption
          mealTypes={mealTypes}
          onSelectMealType={handleMealTypeChange}
        />

        {/* Selected Employees List */}
        {selectedEmployees.length > 0 ? (
          <div className="space-y-4 mt-4">
            {selectedEmployees.map((employee) => (
              <div
                key={employee.id}
                className="flex justify-between items-center p-3 border border-gray-300 rounded"
              >
                <div>{employee.name}</div>
                <Input
                  type="text"
                  placeholder="Notes"
                  value={employeeNotes[employee.id] || ""}
                  onChange={(e) =>
                    handleNoteChange(employee.id, e.target.value)
                  }
                  className="w-1/2"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No employees selected. Please select employees to proceed.
          </p>
        )}

        {/* Confirm Button */}
        <Button
          onClick={handleSubmit}
          className="mt-4 w-full bg-blue-600 text-white"
        >
          Confirm
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeesSelectionDialog;
