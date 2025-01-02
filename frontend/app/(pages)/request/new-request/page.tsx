"use client";

import Department from "@/components/pages/request/new-request/Department";
import Employee from "@/components/pages/request/new-request/Employee";
import { useState } from "react";

export default function Page() {
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <Department
          selectedDepartments={selectedDepartments}
          setSelectedDepartments={setSelectedDepartments}
        />
      </div>
      <div className="flex-1">
        <Employee selectedDepartments={selectedDepartments} />
      </div>
      <div className="flex-1">
        <Employee selectedDepartments={selectedDepartments} />
      </div>
    </div>
  );
}
