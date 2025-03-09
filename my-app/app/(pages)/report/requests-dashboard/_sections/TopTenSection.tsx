import React, { Suspense } from "react";
import DepartmentTable from "../_components/TopTenTable";

interface TopTenSectionProps {
  records: {
    department: string;
    dinnerRequests: number;
    lunchRequests: number;
  }[];
}

const TopTenSection: React.FC<TopTenSectionProps> = ({ records }) => {
  return (
    <div className="flex-1 bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">Top 10 Requester Departments</h3>
      <Suspense fallback={<div>Loading Table...</div>}>
        <DepartmentTable data={records} />
      </Suspense>
    </div>
  );
};

export default TopTenSection;
