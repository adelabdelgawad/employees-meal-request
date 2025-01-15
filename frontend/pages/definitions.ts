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

import { ColumnDef } from '@tanstack/react-table';

export interface Column {
  id: string;
  header: React.ReactNode;
  isVisible: boolean;
}

export interface ViewProps {
  columns: Column[];
  toggleColumnVisibility: (id: string) => void;
}

/**
 * Custom column definition extending ColumnDef from @tanstack/react-table.
 * The meta field is used for custom properties like enableFiltering, isVisible, and enableDateTimeFilter.
 */
export type CustomColumnDef<TData> = ColumnDef<TData> & {
  meta?: {
    enableFiltering?: boolean;
    enableInputFiltering?: boolean;
    isVisible?: boolean;
    enableDateTimeFilter?: boolean;
  };
};

export interface RequestRecord {
  id: number;
  status_name: string;
  status_id: number;
  requester: string;
  requester_title?: string;
  meal_type: string;
  request_time: string;
  closed_time?: string;
  notes?: string;
  total_order_lines: number;
  accepted_order_lines: number;
}

export interface ChangedStatus {
  id: number;
  is_accepted: boolean;
}

// Code 	Name 	Title 	Department 	Requester 	Requester Title 	Request Time 	Meal Type 	Attendance In 	Attendance Out 	Hours 	Notes
export interface ReportDetailRecord {
  id: number;
  code: number;
  name: string;
  title: string;
  department_name: string;
  requester_name: string;
  requester_title: string;
  request_time: Date;
  meal_type: string;
  attendance_in: Date;
  attendance_out: Date;
  hours: number;
  notes: string;
}
