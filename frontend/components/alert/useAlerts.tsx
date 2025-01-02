// useAlerts.tsx
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export interface Alert {
    id: string;
    message: string;
    type: "success" | "warning" | "error"; // Alert types
}

export default function useAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    const addAlert = (message: string, type: "success" | "warning" | "error" = "success") => {
        const id = uuidv4();
        setAlerts((prevAlerts) => [...prevAlerts, { id, message, type }]);

        // Automatically remove the alert after 3 seconds
        setTimeout(() => {
            removeAlert(id);
        }, 3000);
    };

    const removeAlert = (id: string) => {
        setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
    };

    return { alerts, addAlert, removeAlert };
}
