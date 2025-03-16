import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label"; // Adjust the import path based on your project

interface MealProps {
  Meals: Meal[];
  selectedMeals: Meal[];
  onSelectMeal: (selectedMeals: Meal[]) => void;
}

export default function MealOption({
  Meals,
  selectedMeals,
  onSelectMeal,
}: MealProps) {
  const [initialized, setInitialized] = useState(false);

  // Set the first meal as selected by default when the component mounts
  useEffect(() => {
    if (Meals.length > 0 && !initialized) {
      onSelectMeal([Meals[0]]);
      setInitialized(true);
    }
  }, [Meals, initialized, onSelectMeal]);

  const handleSelectionChange = (id: number) => {
    let updatedSelectedMeals = [...selectedMeals];

    if (updatedSelectedMeals.some((meal) => meal.id === id)) {
      // Remove meal from selection
      updatedSelectedMeals = updatedSelectedMeals.filter(
        (meal) => meal.id !== id
      );
    } else {
      // Add meal to selection
      const selectedMeal = Meals.find((meal) => meal.id === id);
      if (selectedMeal) {
        updatedSelectedMeals.push(selectedMeal);
      }
    }

    onSelectMeal(updatedSelectedMeals);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Line 2: Meals take full space */}
      <div className="flex flex-row flex-wrap gap-2 w-full">
        {Meals.map((meal) => (
          <div
            key={meal.id}
            onClick={() => handleSelectionChange(meal.id)}
            className={`p-4 border rounded flex items-center justify-center cursor-pointer ${
              selectedMeals.some((selectedMeal) => selectedMeal.id === meal.id)
                ? "bg-blue-100 border-blue-500"
                : "border-gray-300"
            }`}
            style={{ flex: "1 1 calc(25% - 1rem)" }} // Adjust width for meals
          >
            <Label htmlFor={`Meal-${meal.id}`} className="text-sm font-medium">
              {meal.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
