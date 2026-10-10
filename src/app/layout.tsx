import type { Metadata } from 'next';
import './globals.css';
import { LoungeProvider } from '../context/LoungeContext';
import { Navbar } from '../components/shared/Navbar';

export const metadata: Metadata = {
  title: 'Clash - PlayStation Lounge & Cafe',
  description: 'Minimal PlayStation Lounge and Cafe Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Rubik+Burned&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#171717] text-[#DEDEDE] antialiased selection:bg-[#F25623] selection:text-white pb-24">
        <LoungeProvider>
          {children}
          <Navbar />
        </LoungeProvider>
      </body>
    </html>
  );
}
