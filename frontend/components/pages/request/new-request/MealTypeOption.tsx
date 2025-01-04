import { Label } from "@/components/ui/label"; // Adjust the import path based on your project
import { MealType } from "@/lib/definitions";

interface MealTypeProps {
  mealTypes: MealType[];
  selectedMealTypes: MealType[];
  onSelectMealType: (selectedMealTypes: MealType[]) => void;
}

export default function MealTypeOption({
  mealTypes,
  selectedMealTypes,
  onSelectMealType,
}: MealTypeProps) {
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

    onSelectMealType(updatedSelectedMealTypes);
  };

  return (
    <div className="flex flex-wrap gap-4">
      {mealTypes.map((mealType) => (
        <div
          key={mealType.id}
          onClick={() => handleSelectionChange(mealType.id)}
          className={`p-4 border rounded flex flex-grow items-center justify-center text-center cursor-pointer ${
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
