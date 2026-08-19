import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Video Annotation v0',
  description: 'Minimal video annotation infrastructure',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}