import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Summit Home Services | Residential HVAC Care',
  description:
    'Request a residential HVAC repair, replacement, maintenance, or indoor air-quality estimate from Summit Home Services.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
