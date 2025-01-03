import { useState } from "react";
import { Label } from "@/components/ui/label"; // Adjust the import path based on your project

interface MealType {
  id: number;
  name: string;
}

interface MealTypeProps {
  mealTypes: MealType[];
  onSelectMealType: (selectedMealTypes: MealType[]) => void;
}

export default function MealTypeOption({
  mealTypes,
  onSelectMealType,
}: MealTypeProps) {
  const [selectedMealTypes, setSelectedMealTypes] = useState<MealType[]>([]);

  const handleSelectionChange = (id: number) => {
    let updatedSelectedMealTypes = [...selectedMealTypes];

    if (updatedSelectedMealTypes.some((mealType) => mealType.id === id)) {
      updatedSelectedMealTypes = updatedSelectedMealTypes.filter(
        (mealType) => mealType.id !== id
      );
    } else {
      const selectedMealType = mealTypes.find((mealType) => mealType.id === id);
      if (selectedMealType) {
        updatedSelectedMealTypes.push(selectedMealType);
      }
    }

    setSelectedMealTypes(updatedSelectedMealTypes);
    onSelectMealType(updatedSelectedMealTypes);
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
      {mealTypes.map((mealType) => (
        <div
          key={mealType.id}
          onClick={() => handleSelectionChange(mealType.id)}
          className={`p-4 border rounded flex items-center justify-center text-center cursor-pointer ${
            selectedMealTypes.some(
              (selectedMealType) => selectedMealType.id === mealType.id
            )
              ? "bg-blue-100 border-blue-500"
              : "border-gray-300"
          }`}
        >
          <Label
            htmlFor={`mealType-${mealType.id}`}
            className="text-sm font-medium"
          >
            {mealType.name}
          </Label>
        </div>
      ))}
    </div>
  );
}
