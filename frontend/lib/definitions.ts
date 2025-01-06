export interface DepartmentType {
  id: number;
  name: string;
}
export interface EmployeeType {
  id: number;
  code: number;
  name: string;
  title: string;
  is_active: string;
  department_id: string;
}

export interface MealType {
  id: number;
  name: string;
}

export interface RequestRecord {
  id: number;
  requester: string;
  title: string;
  requestTime: string;
  closedTime: string;
  notes: string;
  mealType: string;
  requests: number;
  accetpted: number;
  requestStatus: string;
}
