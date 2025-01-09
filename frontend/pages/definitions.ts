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

import { ColumnDef } from "@tanstack/react-table";

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
