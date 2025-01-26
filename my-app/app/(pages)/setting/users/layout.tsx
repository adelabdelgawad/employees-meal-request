'use client';

import { SettingUserProvider } from '@/hooks/SettingUserContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SettingUserProvider>{children}</SettingUserProvider>;
}
