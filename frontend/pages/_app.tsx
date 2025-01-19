// pages/_app.tsx
import React from 'react';
import { AppProps } from 'next/app';
import { initializeIcons } from '@fluentui/react/lib/Icons';
// pages/_app.tsx

// Initialize Fluent UI icons globally
initializeIcons();

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
