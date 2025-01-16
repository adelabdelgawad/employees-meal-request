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
    fullName: string;
    username: string;
    title: string;
    roles: { id: number; name: string }[] | string[];
  };
  type ReportDetailRecord = {
    id: number;
    code: number;
    name: string;
    title: string;
    department_name: string;
    requester_name: string;
    requester_title: string;
    request_time: string;
    meal: string;
    attendance_in: string;
    attendance_out: string;
    hours: number;
    notes: string;
  };
}

export {};
