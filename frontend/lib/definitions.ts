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
  status_name: string;
  status_id: number;
  requester?: string;
  requester_title?: string;
  meal_type: string;
  request_time: string;
  closed_time?: string;
  notes?: string;
}
