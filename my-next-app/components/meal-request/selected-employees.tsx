"use client"

import { UserCheck, ChevronLeft, UserMinus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SelectedEmployeesProps {
  departments: DepartmentWithEmployees[]
  selectedEmployees: Employee[]
  onRemoveEmployee: (id: number) => void
  onClearSelectedEmployees: () => void
}

export function SelectedEmployees({
  departments,
  selectedEmployees,
  onRemoveEmployee,
  onClearSelectedEmployees,
}: SelectedEmployeesProps) {
  // Find department name by department_id
  const getDepartmentName = (departmentId: string): string => {
    const department = departments.find((dept) => dept.employees.some((emp) => emp.department_id === departmentId))
    return department?.department || "Unknown Department"
  }

  return (
    <Card className="border shadow-sm w-full md:w-1/3">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Selected Employees</CardTitle>
          </div>
          <Badge>{selectedEmployees.length}</Badge>
        </div>
        <div className="relative">
          <Input placeholder="Search selected employees..." className="pl-2" disabled />
        </div>
        <div className="flex justify-between mt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onClearSelectedEmployees}
            disabled={selectedEmployees.length === 0}
          >
            <UserMinus className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-160px)]">
        <ScrollArea className="h-full p-4">
          <div className="space-y-1">
            {selectedEmployees.length > 0 ? (
              selectedEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                  <Button size="icon" variant="ghost" onClick={() => onRemoveEmployee(emp.id)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 ml-2">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">
                        {emp.code}
                      </Badge>
                      <p className="font-medium">{emp.name}</p>
                    </div>
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-muted-foreground">
                        {getDepartmentName(emp.department_id)} • {emp.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground">
                <UserCheck className="h-12 w-12 mb-2 opacity-20" />
                <p>No employees selected</p>
                <p className="text-sm">Select employees from the middle column</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

