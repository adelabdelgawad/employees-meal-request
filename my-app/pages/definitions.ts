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

export interface Meal {
  id: number;
  name: string;
}

export interface RequestRecord {
  id: number;
  status_name: string;
  status_id: number;
  requester: string;
  requester_title?: string;
  meal: string;
  request_time: string;
  closed_time?: string;
  notes?: string;
  total_lines: number;
  accepted_lines: number;
}

export interface ChangedStatus {
  id: number;
  is_accepted: boolean;
}

export interface ReportDetailRecord {
  id: number;
  code: number;
  name: string;
  title: string;
  department_name: string;
  requester_name: string;
  requester_title: string;
  request_time: Date;
  meal: string;
  attendance_in: Date;
  attendance_out: Date;
  hours: number;
  notes: string;
}
