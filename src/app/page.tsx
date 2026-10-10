'use client';

import React from 'react';
import { CustomerDeviceGrid } from '../components/customer/CustomerDeviceGrid';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#171717] text-[#DEDEDE] flex flex-col py-8 px-4 sm:px-6 pb-28">
      <main className="flex-1 w-full max-w-6xl mx-auto">
        <CustomerDeviceGrid />
      </main>
    </div>
  );
}
