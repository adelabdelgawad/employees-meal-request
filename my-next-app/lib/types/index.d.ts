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
    fullname: string;
    username: string;
    title: string;
  };

  type User = {
    id: number;
    username: string;
    fullname: string;
    title: string;
    email: string;
    roles: str[];
  };

  type UserCreate = {
    id: number;
    username: string;
    fullname: string;
    title: string;
    roles: number[]; 
    active: boolean;
  }

  type UserWithRoles  = {
    id: number;
    username: string;
    fullname: string;
    title: string;
    roles: Record<string, boolean>; 
    active: boolean;
  }
  
  interface SessionPayload {
    user: User;
    expiresAt: Date;
    iat: number;
    exp: number;
  }

  type ReportDetailRecord = {
    id: number;
    employee_code: number;
    employee_name: string;
    employee_title: string;
    department: string;
    requester_name: string;
    requester_title: string;
    request_time: Date;
    meal: string;
    attendance_in: string;
    attendance_out: string;
    hours: number;
    notes: string;
  };

  type ReportDetailsRecord = {
    id: number;
    employee_code: number;
    employee_name: string;
    employee_title: string;
    department: string;
    requester_name: string;
    requester_title: string;
    request_time: Date;
    meal: string;
    attendance_in: string;
    attendance_out: string;
    shift_hours: number;
    notes: string;
  };
  type RequestsResponse = {
    data: RequestRecord[];
    current_page: number;
    page_size: number;
    total_pages: number;
    total_rows: number;
  };
  type RequestLine = {
    id: number;
    name: string;
    title: string;
    code: number;
    notes: string;
    attendance_in: Date;
    shift_hours: number;
    is_accepted: boolean;
    is_deleted: boolean;
  };
  type ReportDashboardResponse = {
    id: number;
    department: string;
    dinner_requests: number;
    lunch_requests: number;
  };
  type ReportDetailsResponse = {
    request_lines: ReportDetailsRecord[];
    current_pages: number;
    page_size: number;
    total_pages: number;
    total_rows: number;
  };
  type DashboardRecord = {
    department: string;
    dinnerRequests: number;
    lunchRequests: number;
  };

  type Role = {
    id: number;
    name: string;
  };
  interface HistoryRequest {
    id: number;
    request_time?: string;
    meal?: string;
    status_name?: string;
    status_id?: number;
    closed_time?: string;
    total_lines?: number;
    accepted_lines?: number;
    notes?: string;
  }
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
  interface DepartmentType {
    id: number;
    name: string;
  }

  interface Employee {
    id: number;
    code: number;
    name: string;
    title: string;
    is_active: string;
    department_id: string;
  }

  type Schedule = {
    id?: number;
    meal_id?: numbet;
    schedule_from: string; // Format: "HH:MM"
    schedule_to: string; // Format: "HH:MM"
    isDeleted?: boolean; // For soft-delete/undo
  };

  type Meal = {
    id: number;
    name: string;
    is_active: boolean;
    schedules?: Schedule[];
  };
  type MealResponse = {
    id: number;
    name: string;
    is_active: boolean;
    meal_schedules?: Schedule[];
  };

  type RequestRecord = {
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
  };
  interface Request {
    id: number;
    requester?: string;
    requester_id?: number;
    requester_title?: string;
    request_time?: string;
    meal?: string;
    status_name?: string;
    status_id?: number;
    closed_time?: string;
    total_lines?: number;
    accepted_lines?: number;
    notes?: string;
  }

  interface ChangedStatus {
    id: number;
    is_accepted: boolean;
  }

  interface ReportDetailRecord {
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
  interface Session {
    user: User;
    expiresAt: Date;
    token: string;
  }
  
  type DepartmentWithEmployees = {
    department: string;
    employees: Employee[];
  };

  type NewRequestDataResponse = {
    departments: DepartmentWithEmployees[];
    meals?: Meal[];
  };
  type SettingUserResponse ={
    roles?: Role[];
    users?: UserWithRoles[];
    domain_users?: DomainUser[];
  }
}

export {};
