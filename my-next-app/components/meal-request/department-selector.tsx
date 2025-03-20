"use client"

import { useState } from "react"
import { Search, Building2, UserPlus, UserMinus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

interface DepartmentSelectorProps {
  departments: DepartmentWithEmployees[]
  selectedDepartmentIds: string[]
  onSelectDepartment: (deptId: string) => void
  onSelectAllDepartments: () => void
  onClearDepartments: () => void
}

export function DepartmentSelector({
  departments,
  selectedDepartmentIds,
  onSelectDepartment,
  onSelectAllDepartments,
  onClearDepartments,
}: DepartmentSelectorProps) {
  const [departmentFilter, setDepartmentFilter] = useState("")

  // Filter departments based on search
  const filteredDepartments = departments.filter((dept) =>
    dept.department.toLowerCase().includes(departmentFilter.toLowerCase()),
  )

  // Check if a department is selected
  const isDepartmentSelected = (id: string) => {
    return selectedDepartmentIds.includes(id)
  }

  // Get department ID from the first employee in the department
  const getDepartmentId = (dept: DepartmentWithEmployees): string => {
    return dept.employees[0]?.department_id || "0"
  }

  return (
    <Card className="border shadow-sm w-full md:w-1/3">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Departments</CardTitle>
          </div>
          <Badge variant="outline">
            {selectedDepartmentIds.length}/{departments.length}
          </Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            className="pl-8"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          />
        </div>
        <div className="flex justify-between mt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-[48%]"
            onClick={onClearDepartments}
            disabled={selectedDepartmentIds.length === 0}
          >
            <UserMinus className="h-4 w-4 mr-1" />
            Remove All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-[48%]"
            onClick={onSelectAllDepartments}
            disabled={selectedDepartmentIds.length === departments.length}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Add All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-160px)]">
        <ScrollArea className="h-full p-4">
          <div className="space-y-1">
            {filteredDepartments.map((dept) => {
              const deptId = getDepartmentId(dept)
              return (
                <div
                  key={deptId}
                  className={`flex items-center justify-between p-2 rounded-md ${
                    isDepartmentSelected(deptId) ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center w-full cursor-pointer" onClick={() => onSelectDepartment(deptId)}>
                    <Checkbox
                      checked={isDepartmentSelected(deptId)}
                      className="mr-2"
                      onCheckedChange={() => onSelectDepartment(deptId)}
                    />
                    <span>{dept.department}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

