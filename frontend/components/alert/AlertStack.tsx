"use client";

import Alert from "./Alert";

interface Alert {
    id: string; // Unique identifier for each alert
    message: string;
    type: "success" | "warning" | "error";
}

interface AlertStackProps {
    alerts: Alert[]; // Array of alerts to display
    onRemove: (id: string) => void; // Callback to remove an alert
}

export default function AlertStack({ alerts, onRemove }: AlertStackProps) {
    return (
        <div className="fixed top-10 right-4 flex flex-col space-y-2 z-50">
            {alerts.map((alert) => (
                <Alert
                    key={alert.id}
                    id={alert.id}
                    message={alert.message}
                    type={alert.type}
                    onRemove={onRemove}
                />
            ))}
        </div>
    );
}
