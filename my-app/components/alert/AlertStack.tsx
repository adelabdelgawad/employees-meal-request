"use client";

import { X } from "lucide-react";
import { useAlerts } from "./useAlerts";

export default function AlertStack() {
  const { alerts, removeAlert } = useAlerts();

  if (!alerts || alerts.length === 0) {
    return null; // ✅ Return null if there are no alerts
  }

  return (
    <div
      className="fixed bottom-4 right-4 space-y-2 z-[9999] max-w-sm w-full"
      aria-live="assertive"
      role="alert"
    >
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg shadow-lg flex items-center justify-between transition-opacity duration-300 ${
            alert.type === "success"
              ? "bg-green-500 text-white"
              : alert.type === "warning"
              ? "bg-yellow-500 text-black"
              : "bg-red-500 text-white"
          }`}
        >
          <div className="flex-1">{alert.message}</div>
          <button
            onClick={() => removeAlert(alert.id)}
            className="ml-4 text-white"
            aria-label="Dismiss alert"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
