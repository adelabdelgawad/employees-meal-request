import { createContext, useContext, useState } from "react";

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
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = (
    message: string,
    type: "success" | "warning" | "error" = "success"
  ) => {
    const id = crypto.randomUUID(); // ✅ Using built-in crypto.randomUUID()
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

export function s() {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error("s must be used within an AlertsProvider");
  }
  return context;
}
