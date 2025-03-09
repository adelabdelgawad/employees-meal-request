import React, { Suspense } from "react";
import DepartmentChart from "../_components/DepartmentChart";

interface ChartSectionProps {
  records: DashboardRecord[];
}

const ChartSection: React.FC<ChartSectionProps> = ({ records }) => {
  return (
    <div className="flex-1 bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">Requests by Department</h3>
      <Suspense fallback={<div>Loading Chart...</div>}>
        <DepartmentChart data={records} />
      </Suspense>
    </div>
  );
};

export default ChartSection;
