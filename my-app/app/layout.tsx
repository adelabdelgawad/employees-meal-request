"use client";
import "./globals.css";
import { AlertsProvider } from "@/components/alert/useAlerts";
import AlertStack from "@/components/alert/AlertStack";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AlertsProvider>
          <AlertStack />
          {children}
        </AlertsProvider>
      </body>
    </html>
  );
}
