import React from "react";
import StatCard from "../_components/StatCard";

interface StatSectionProps {
  totalRequests: number;
  totalDinnerRequests: number;
  totalLunchRequests: number;
}

export default function StatSection({
  totalRequests,
  totalDinnerRequests,
  totalLunchRequests,
}: StatSectionProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard title="Total Requests" value={totalRequests} />
      <StatCard title="Total Dinner Requests" value={totalDinnerRequests} />
      <StatCard title="Total Lunch Requests" value={totalLunchRequests} />
    </div>
  );
}
