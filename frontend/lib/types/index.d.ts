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
}

export {};
