import React from 'react';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#171717] text-[#DEDEDE] flex flex-col py-8 px-4 sm:px-6 pb-28">
      <main className="flex-1 w-full max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
}
