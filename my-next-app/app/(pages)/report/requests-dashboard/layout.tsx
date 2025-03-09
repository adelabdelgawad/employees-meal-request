'use client';

import { ReportRequestProvider } from '@/hooks/ReportRequestContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReportRequestProvider>{children}</ReportRequestProvider>;
}
