'use client';

import { RequestProvider } from '@/hooks/RequestContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequestProvider>{children}</RequestProvider>;
}
