"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DepartmentSelector } from "./department-selector"
import { EmployeeSelector } from "./employee-selector"
import { SelectedEmployees } from "./selected-employees"
import { MealRequestOptions } from "./meal-request-options"
import { getAllEmployees, getEmployeesByDepartment } from "@/lib/meal-request-data"
import clientAxiosInstance from "@/lib/clientAxiosInstance"
import toast from "react-hot-toast"

interface MealRequestFormProps {
  data: NewRequestDataResponse
}

export function MealRequestForm({ data }: MealRequestFormProps) {
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([])
  const [selectedMealIds, setSelectedMealIds] = useState<number[]>([])
  const [requestStatus, setRequestStatus] = useState("now")
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get all employees from the data
  const allEmployees = getAllEmployees(data)

  // Toggle department selection
  const toggleDepartment = (deptId: string) => {
    if (selectedDepartmentIds.includes(deptId)) {
      setSelectedDepartmentIds(selectedDepartmentIds.filter((id) => id !== deptId))
    } else {
      setSelectedDepartmentIds([...selectedDepartmentIds, deptId])
    }
  }

  // Add all departments
  const addAllDepartments = () => {
    const allDepartmentIds = data.departments
      .map((dept) => dept.employees[0]?.department_id || "0")
      .filter((id) => id !== "0")

    setSelectedDepartmentIds(allDepartmentIds)
  }

  // Remove all departments
  const removeAllDepartments = () => {
    setSelectedDepartmentIds([])
  }

  // Add an employee to selection
  const addEmployee = (employee: Employee) => {
    if (!selectedEmployees.some((emp) => emp.id === employee.id)) {
      setSelectedEmployees([...selectedEmployees, employee])
    }
  }

  // Remove an employee from selection
  const removeEmployee = (id: number) => {
    setSelectedEmployees(selectedEmployees.filter((emp) => emp.id !== id))
  }

  // Add all filtered employees
  const addAllEmployees = () => {
    const departmentEmployees = getEmployeesByDepartment(data, selectedDepartmentIds.map(Number))

    const newSelectedEmployees = [...selectedEmployees]

    departmentEmployees.forEach((emp) => {
      if (!selectedEmployees.some((e) => e.id === emp.id)) {
        newSelectedEmployees.push(emp)
      }
    })

    setSelectedEmployees(newSelectedEmployees)
  }

  // Remove all filtered employees
  const removeAllFilteredEmployees = () => {
    const departmentEmployees = getEmployeesByDepartment(data, selectedDepartmentIds.map(Number))

    const departmentEmployeeIds = departmentEmployees.map((emp) => emp.id)
    setSelectedEmployees(selectedEmployees.filter((emp) => !departmentEmployeeIds.includes(emp.id)))
  }

  // Clear all selected employees
  const clearSelectedEmployees = () => {
    setSelectedEmployees([])
  }

  // Toggle meal type selection
  const toggleMeal = (mealId: number) => {
    if (selectedMealIds.includes(mealId)) {
      setSelectedMealIds(selectedMealIds.filter((id) => id !== mealId))
    } else {
      setSelectedMealIds([...selectedMealIds, mealId])
    }
  }

  // Submit the form
// Submit the form with transformed payload
const handleSubmit = async () => {
  if (isSubmitting) return

  setIsSubmitting(true)

  try {
    const requestTime = requestStatus === "scheduled" && scheduledDate ? scheduledDate : new Date()

    // Transform selectedEmployees and selectedMealIds into an array of request items
    const requests = selectedEmployees.flatMap((employee) =>
      selectedMealIds.map((mealId) => {
        // Find the meal details by matching meal id from the data
        const meal = data.meals?.find((m) => m.id === mealId)
        return {
          employee_id: employee.id,
          employee_code: employee.code,
          name: employee.name,
          department_id: employee.department_id,
          meal_id: mealId,
          meal_name: meal?.name || "", // fallback to empty string if meal not found
          notes: notes, // you could also set individual notes per request if needed
        }
      })
    )

    // Format the request data according to the API requirements
    await clientAxiosInstance.post("request/submit-request", {
      requests,
      notes, // global notes if needed
      request_timing_option: requestStatus,
      request_time: requestTime,
    })

    // Show success toast
    toast.success("Meal request submitted")

    // Reset form after successful submission
    if (requestStatus === "now") {
      setSelectedEmployees([])
      setSelectedMealIds([])
      setNotes("")
    }
  } catch (error) {
    console.error("Error submitting meal request:", error)

    toast.error("There was a problem submitting your request. Please try again.")

  } finally {
    setIsSubmitting(false)
  }
}


  // Check if submit should be disabled
  const isSubmitDisabled =
    isSubmitting ||
    selectedEmployees.length === 0 ||
    (requestStatus === "scheduled" && !scheduledDate) ||
      selectedMealIds.length === 0;
  
    return (
      <div className="mx-auto">
      <Card className="mb-4">
        <CardContent className="pt-6">
          {/* Three columns sidede by side */}
          <div className="flex flex-row space-x-4 h-[700px]">
            {/* Departments Column */}
            <DepartmentSelector
              departments={data.departments}
              selectedDepartmentIds={selectedDepartmentIds}
              onSelectDepartment={toggleDepartment}
              onSelectAllDepartments={addAllDepartments}
              onClearDepartments={removeAllDepartments}
            />

            {/* Employees Column */}
            <EmployeeSelector
              departments={data.departments}
              employees={allEmployees}
              selectedDepartmentIds={selectedDepartmentIds}
              selectedEmployees={selectedEmployees}
              onAddEmployee={addEmployee}
              onAddAllEmployees={addAllEmployees}
              onRemoveAllFilteredEmployees={removeAllFilteredEmployees}
            />

            {/* Selected Employees Column */}
            <SelectedEmployees
              departments={data.departments}
              selectedEmployees={selectedEmployees}
              onRemoveEmployee={removeEmployee}
              onClearSelectedEmployees={clearSelectedEmployees}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bottom section with request time, notes, and meal type */}
      <Card>
        <CardContent className="pt-6">
          <MealRequestOptions
            meals={data.meals || []}
            selectedMealIds={selectedMealIds}
            requestStatus={requestStatus}
            scheduledDate={scheduledDate}
            notes={notes}
            onMealToggle={toggleMeal}
            onRequestStatusChange={setRequestStatus}
            onScheduledDateChange={setScheduledDate}
            onNotesChange={setNotes}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isSubmitDisabled={isSubmitDisabled}
          />
        </CardContent>
      </Card>
    </div>
  )
}

