import React from 'react';
import { AdminAuthGuard } from '../../components/auth/AdminAuthGuard';
import { AdminHeaderBar } from '../../components/admin/AdminHeaderBar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#171717] text-[#DEDEDE] flex flex-col py-8 px-4 sm:px-6 pb-28">
      <main className="flex-1 w-full max-w-6xl mx-auto">
        <AdminAuthGuard>
          <AdminHeaderBar />
          {children}
        </AdminAuthGuard>
      </main>
    </div>
  );
}
