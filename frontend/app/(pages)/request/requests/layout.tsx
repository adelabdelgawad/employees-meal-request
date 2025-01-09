"use client";

import { AlertsProvider } from "@/components/alert/useAlerts";
import AlertStack from "@/components/alert/AlertStack";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <AlertsProvider>
        {children}
        <AlertStack />
      </AlertsProvider>
  );
}
