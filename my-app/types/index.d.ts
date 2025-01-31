declare global {
  type ReportRequestRecord = {
    id: number;
    department: string;
    dinnerRequests: number;
    lunchRequests: number;
  };
  type Role = {
    id: number;
    name: string;
    description: string;
  };

  type DomainUser = {
    id: number;
    fullName: string;
    username: string;
    title: string;
  };

  type User = {
    id: number;
    username: string;
    fullName: string;
    title: string;
    email: string;
    roles: string[];
    accessToken: string;
  };
  type ReportDetailRecord = {
    id: number;
    employee_code: number;
    employee_name: string;
    employee_title: string;
    department: string;
    requester_name: string;
    requester_title: string;
    request_time: string;
    meal: string;
    attendance_in: string;
    attendance_out: string;
    hours: number;
    notes: string;
  };
  interface ReportDetailsData {
    id: number;
    employee_code?: number;
    employee_name?: string;
    employee_title?: string;
    department?: string;
    requester_name?: string;
    requester_title?: string;
    request_time?: string;
    meal?: string;
    attendance_in?: string;
    attendance_out?: string;
    shift_hours?: number;
    notes?: string;
  }
}

export {};
