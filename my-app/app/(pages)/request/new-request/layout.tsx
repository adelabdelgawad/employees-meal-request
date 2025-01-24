'use client';

import { NewRequestProvider } from '@/hooks/NewRequestContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NewRequestProvider>{children}</NewRequestProvider>;
}
