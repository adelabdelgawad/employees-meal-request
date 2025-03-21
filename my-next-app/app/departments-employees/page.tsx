import { Suspense } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Trash2 } from "lucide-react";
import SelectionColumn from "@/components/SelectionColumn";

// Sample user data (replace with API call in a real app)
const userData = [
  {
    department: "IT",
    employees: [
      { code: "p1", name: "Adel", title: "Manager" },
      { code: "p2", name: "Mohamed", title: "Support" },
    ],
  },
  {
    department: "HR",
    employees: [
      { code: "h1", name: "Sara", title: "Recruiter" },
      { code: "h2", name: "Ahmed", title: "HR Specialist" },
    ],
  },
];

// Types
interface Employee {
  code: string;
  name: string;
  title: string;
}

interface Department {
  department: string;
  employees: Employee[];
}

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function DepartmentsEmployeesPage({
  searchParams,
}: PageProps) {
  const deptSearch = (searchParams.deptSearch as string) || "";
  const empSearch = (searchParams.empSearch as string) || "";
  const selectedDepts = searchParams.selectedDepts
    ? (searchParams.selectedDepts as string).split(",")
    : [];

  // Simulate fetching data
  const departments: Department[] = userData;

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Department Column with Checkboxes */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading departments...</div>}>
              <DepartmentColumn
                departments={departments}
                selectedDepts={selectedDepts}
                searchQuery={deptSearch}
              />
            </Suspense>
          </CardContent>
        </Card>

        {/* Employee Column */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading employees...</div>}>
              <EmployeeColumn
                departments={departments}
                selectedDepts={selectedDepts}
                searchQuery={empSearch}
              />
            </Suspense>
          </CardContent>
        </Card>

        {/* Selected Employees Column */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Selected Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading selected employees...</div>}>
              <SelectedEmployeesColumn
                selectedEmployees={
                  searchParams.selectedEmployees
                    ? (searchParams.selectedEmployees as string).split(",")
                    : []
                }
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Department Column with Checkboxes
async function DepartmentColumn({
  departments,
  selectedDepts,
  searchQuery,
}: {
  departments: Department[];
  selectedDepts: string[];
  searchQuery: string;
}) {
  const filteredDepts = departments.filter((d) =>
    searchQuery
      ? d.department.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="space-y-4">
      <form action="/departments-employees" method="GET" className="space-y-2">
        <Input
          type="text"
          name="deptSearch"
          defaultValue={searchQuery}
          placeholder="Search by name"
          className="w-full"
        />
        <div className="flex gap-2">
          <Button
            type="submit"
            name="selectedDepts"
            value={filteredDepts.map((d) => d.department).join(",")}
            variant="outline"
            className="flex-1"
          >
            Select All
          </Button>
          <Button
            type="submit"
            name="selectedDepts"
            value=""
            variant="outline"
            className="flex-1"
          >
            Deselect All
          </Button>
        </div>
      </form>
      <ScrollArea className="h-[300px]">
        {filteredDepts.length ? (
          filteredDepts.map((dept) => {
            const isChecked = selectedDepts.includes(dept.department);
            const newSelectedDepts = isChecked
              ? selectedDepts.filter((d) => d !== dept.department)
              : [...selectedDepts, dept.department];

            return (
              <form
                key={dept.department}
                action="/departments-employees"
                method="GET"
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="selectedDepts"
                    value={newSelectedDepts.join(",")}
                    checked={isChecked}
                    onChange={() => {}}
                    className="hidden"
                  />
                  <span>{dept.department}</span>
                </label>
                <Button type="submit" variant="ghost" size="sm">
                  <Check
                    className={`w-4 h-4 ${
                      isChecked ? "text-green-500" : "text-gray-400"
                    }`}
                  />
                </Button>
              </form>
            );
          })
        ) : (
          <p className="text-muted-foreground text-center">
            No departments found
          </p>
        )}
      </ScrollArea>
    </div>
  );
}

// Employee Column (reuses SelectionColumn logic)
async function EmployeeColumn({
  departments,
  selectedDepts,
  searchQuery,
}: {
  departments: Department[];
  selectedDepts: string[];
  searchQuery: string;
}) {
  const filteredEmployees = departments
    .filter((d) => selectedDepts.includes(d.department))
    .flatMap((d) => d.employees)
    .filter((e) =>
      searchQuery
        ? e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  return (
    <SelectionColumn
      type="employee"
      items={filteredEmployees.map((e) => ({
        id: e.code,
        name: `${e.name} (${e.title})`,
      }))}
      searchQuery={searchQuery}
      searchParamKey="empSearch"
      disabled={!selectedDepts.length}
    />
  );
}

// Selected Employees Column
async function SelectedEmployeesColumn({
  selectedEmployees,
}: {
  selectedEmployees: string[];
}) {
  const allEmployees = userData.flatMap((d) => d.employees);
  const selected = allEmployees.filter((e) =>
    selectedEmployees.includes(e.code)
  );

  return (
    <div className="space-y-4">
      <form action="/departments-employees" method="GET" className="space-y-2">
        <Button
          type="submit"
          name="selectedEmployees"
          value=""
          variant="outline"
          className="w-full"
        >
          Remove All
        </Button>
      </form>
      <ScrollArea className="h-[300px]">
        {selected.length ? (
          selected.map((emp) => (
            <div
              key={emp.code}
              className="flex items-center justify-between py-2 border-b last:border-b-0"
            >
              <span>{`${emp.name} (${emp.title})`}</span>
              <form action="/departments-employees" method="GET">
                <input
                  type="hidden"
                  name="selectedDepts"
                  value={selectedEmployees.join(",")}
                />
                <input
                  type="hidden"
                  name="selectedEmployees"
                  value={selectedEmployees
                    .filter((code) => code !== emp.code)
                    .join(",")}
                />
                <Button type="submit" variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </form>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center">
            No employees selected
          </p>
        )}
      </ScrollArea>
    </div>
  );
}
