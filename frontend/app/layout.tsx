import './globals.css';
import type { ReactNode } from 'react';

export const metadata = { title: '4thepeople', description: 'Club & event manager' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
