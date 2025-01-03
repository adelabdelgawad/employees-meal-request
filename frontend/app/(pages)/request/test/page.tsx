"use client";

import { useRequest } from "@/context/RequestContext";

export default function ExampleComponent() {
  const { departments, employees, mealTypes } = useRequest();

  return (
    <div>
      <h2>Departments</h2>
      {departments.map((dept) => (
        <p key={dept.id}>{dept.name}</p>
      ))}

      <h2>Employees</h2>
      {employees.map((emp) => (
        <p key={emp.id}>{emp.name}</p>
      ))}

      <h2>Meal Types</h2>
      {mealTypes.map((meal) => (
        <p key={meal.id}>{meal.name}</p>
      ))}
    </div>
  );
}
