"use client";

import { useAlerts } from "./useAlerts";

export default function AlertStack() {
  const { alerts } = useAlerts();

  if (!alerts || alerts.length === 0) {
    return null; // ✅ Return null if there are no alerts
  }

  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded shadow-lg ${
            alert.type === "success"
              ? "bg-green-500 text-white"
              : alert.type === "warning"
              ? "bg-yellow-500 text-black"
              : "bg-red-500 text-white"
          }`}
        >
          {alert.message}
        </div>
      ))}
    </div>
  );
}
