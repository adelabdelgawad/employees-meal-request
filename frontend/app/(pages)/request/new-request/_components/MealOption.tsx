import { Label } from "@/components/ui/label"; // Adjust the import path based on your project
import { Meal } from "@/pages/definitions";

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
  const handleSelectionChange = (id: number) => {
    let updatedSelectedMeals = [...selectedMeals];

    if (updatedSelectedMeals.some((Meal) => Meal.id === id)) {
      updatedSelectedMeals = updatedSelectedMeals.filter(
        (Meal) => Meal.id !== id
      );
    } else {
      const selectedMeal = Meals.find((Meal) => Meal.id === id);
      if (selectedMeal) {
        updatedSelectedMeals.push(selectedMeal);
      }
    }

    onSelectMeal(updatedSelectedMeals);
  };

  return (
    <div className="flex flex-wrap gap-4">
      {Meals.map((Meal) => (
        <div
          key={Meal.id}
          onClick={() => handleSelectionChange(Meal.id)}
          className={`p-4 border rounded flex flex-grow items-center justify-center text-center cursor-pointer ${
            selectedMeals.some(
              (selectedMeal) => selectedMeal.id === Meal.id
            )
              ? "bg-blue-100 border-blue-500"
              : "border-gray-300"
          }`}
        >
          <Label
            htmlFor={`Meal-${Meal.id}`}
            className="text-sm font-medium"
          >
            {Meal.name}
          </Label>
        </div>
      ))}
    </div>
  );
}
