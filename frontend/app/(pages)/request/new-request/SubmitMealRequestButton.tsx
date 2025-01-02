"use client";

interface SubmitMealRequestButtonProps {
    selectedEmployees: any[];
    onSubmit: (selectedEmployees: any[]) => void;
}

export default function SubmitMealRequestButton({ selectedEmployees, onSubmit }: SubmitMealRequestButtonProps) {
    const handleSubmit = () => {
        if (selectedEmployees.length === 0) {
            alert("No employees selected to submit the meal request.");
            return;
        }

        // Call the provided onSubmit handler
        onSubmit(selectedEmployees);
    };

    return (
        <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white py-2 px-4 rounded w-full h-full hover:bg-blue-600 transition-all"
        >
            Submit Meal Request
        </button>
    );
}
