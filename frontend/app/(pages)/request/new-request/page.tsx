"use client";

import { RequestProvider } from "@/context/RequestContext";
import DepartmentColumn from "@/components/pages/request/new-request/DepartmentColumn";
import EmployeeColumn from "@/components/pages/request/new-request/EmployeeColumn";

export default function Page() {
  return (
    <RequestProvider>
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <DepartmentColumn />
        </div>
        <div className="flex-1">
          <EmployeeColumn />
        </div>
      </div>
    </RequestProvider>
  );
}
