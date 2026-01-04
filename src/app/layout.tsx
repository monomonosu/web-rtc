import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WebRTC Video Chat',
  description: 'Real-time video calling application using WebRTC and Next.js',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
