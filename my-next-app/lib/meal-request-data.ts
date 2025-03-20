// Helper function to get all employees from all departments
export function getAllEmployees(data: NewRequestDataResponse) {
  return data.departments.flatMap((dept) => dept.employees)
}

// Helper function to get active employees only
export function getActiveEmployees(data: NewRequestDataResponse) {
  return getAllEmployees(data).filter((emp) => emp.is_active)
}

// Helper function to get employees by department ID
export function getEmployeesByDepartment(data: NewRequestDataResponse, departmentIds: number[]) {
  if (departmentIds.length === 0) return getAllEmployees(data);

  return getAllEmployees(data).filter((emp) =>
    departmentIds.includes(Number(emp.department_id))
  );
}

