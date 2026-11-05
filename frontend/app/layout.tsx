import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '4THEPEOPLE // Club & Event Portal',
  description: 'Cyber-vibrant pulse for campus gatherings, hackathons, and cultural fests.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0a0e17" />
      </head>
      <body>{children}</body>
    </html>
  );
}
