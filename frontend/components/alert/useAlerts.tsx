import { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Alert {
  id: string;
  message: string;
  type: "success" | "warning" | "error";
}

interface AlertsContextType {
  alerts: Alert[];
  addAlert: (message: string, type: "success" | "warning" | "error") => void;
  removeAlert: (id: string) => void;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]); // ✅ Ensure alerts is an empty array initially

  const addAlert = (
    message: string,
    type: "success" | "warning" | "error" = "success"
  ) => {
    const id = uuidv4();
    setAlerts((prevAlerts) => [...prevAlerts, { id, message, type }]);

    // Automatically remove the alert after 3 seconds
    setTimeout(() => {
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
    }, 3000);
  };

  const removeAlert = (id: string) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  };

  return (
    <AlertsContext.Provider value={{ alerts, addAlert, removeAlert }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error("useAlerts must be used within an AlertsProvider");
  }
  return context;
}
