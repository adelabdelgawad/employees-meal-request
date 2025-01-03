"use client";
import { RequestProvider } from "@/context/RequestContext";
import { AlertsProvider } from "@/components/alert/useAlerts";
import AlertStack from "@/components/alert/AlertStack";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequestProvider>
      <AlertsProvider>
        {children}
        <AlertStack />
      </AlertsProvider>
    </RequestProvider>
  );
}
