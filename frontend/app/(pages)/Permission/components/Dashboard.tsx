import React from "react";

interface UserCardProps {
  icon: React.ReactNode; // Pass an icon as a React component
  title: string; // Title of the card
  value: string; // Main value displayed
}

function UserCard({ icon, title, value }: UserCardProps) {
  return (
    <div className="flex items-center space-x-4 rounded-lg border p-4 shadow-sm bg-white">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardCards() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <UserCard
        icon={<span className="text-blue-500 text-2xl">👤</span>}
        title="Admin"
        value="3"
      />
      <UserCard
        icon={<span className="text-gray-600 text-2xl">👥</span>}
        title="Users"
        value="274 / 300"
      />
    </div>
  );
}
