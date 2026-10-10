'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Tv, 
  Gamepad2, 
  Coffee, 
  Wallet, 
  Wrench, 
  ArrowLeftRight
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <nav 
      aria-label="Bottom Navigation" 
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-[#1E1E1E]/95 backdrop-blur-xl border border-[#4D4D4D] shadow-2xl shadow-black/70 rounded-2xl p-1.5 flex items-center gap-1"
    >
        {isAdmin ? (
          <>
            {/* 1. Devices / Home */}
            <Link
              href="/admin"
              title="Consoles & Sessions"
              className={`p-3 rounded-xl transition-all duration-200 ${
                pathname === '/admin'
                  ? 'bg-[#F25623] text-white shadow-md shadow-[#F25623]/30'
                  : 'text-[#DEDEDE]/70 hover:text-white hover:bg-[#2A2A2A]'
              }`}
            >
              <Tv className="w-5 h-5" />
            </Link>

            {/* 2. Cafe & POS */}
            <Link
              href="/admin/cafe"
              title="Cafe POS & Orders"
              className={`p-3 rounded-xl transition-all duration-200 ${
                pathname === '/admin/cafe'
                  ? 'bg-[#F25623] text-white shadow-md shadow-[#F25623]/30'
                  : 'text-[#DEDEDE]/70 hover:text-white hover:bg-[#2A2A2A]'
              }`}
            >
              <Coffee className="w-5 h-5" />
            </Link>

            {/* 3. Games Library */}
            <Link
              href="/admin/games"
              title="Games Library"
              className={`p-3 rounded-xl transition-all duration-200 ${
                pathname === '/admin/games'
                  ? 'bg-[#F25623] text-white shadow-md shadow-[#F25623]/30'
                  : 'text-[#DEDEDE]/70 hover:text-white hover:bg-[#2A2A2A]'
              }`}
            >
              <Gamepad2 className="w-5 h-5" />
            </Link>

            {/* 4. Finance & Shift */}
            <Link
              href="/admin/finance"
              title="Finance & Shifts"
              className={`p-3 rounded-xl transition-all duration-200 ${
                pathname === '/admin/finance'
                  ? 'bg-[#F25623] text-white shadow-md shadow-[#F25623]/30'
                  : 'text-[#DEDEDE]/70 hover:text-white hover:bg-[#2A2A2A]'
              }`}
            >
              <Wallet className="w-5 h-5" />
            </Link>

            {/* 5. Maintenance */}
            <Link
              href="/admin/maintenance"
              title="Maintenance Log"
              className={`p-3 rounded-xl transition-all duration-200 ${
                pathname === '/admin/maintenance'
                  ? 'bg-[#F25623] text-white shadow-md shadow-[#F25623]/30'
                  : 'text-[#DEDEDE]/70 hover:text-white hover:bg-[#2A2A2A]'
              }`}
            >
              <Wrench className="w-5 h-5" />
            </Link>

            {/* Divider */}
            <div className="w-[1px] h-6 bg-[#4D4D4D]/70 mx-1" />

            {/* 6. Switch to Customer View */}
            <Link
              href="/"
              title="Switch to Customer Screen"
              className="p-3 rounded-xl text-[#DEDEDE]/60 hover:text-[#F25623] hover:bg-[#2A2A2A] transition-all duration-200"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </Link>
          </>
        ) : (
          <>
            {/* Customer Navigation */}
            {/* 1. Devices Status */}
            <Link
              href="/"
              title="Available Consoles"
              className={`p-3 rounded-xl transition-all duration-200 ${
                pathname === '/' || pathname === '/customer'
                  ? 'bg-[#F25623] text-white shadow-md shadow-[#F25623]/30'
                  : 'text-[#DEDEDE]/70 hover:text-white hover:bg-[#2A2A2A]'
              }`}
            >
              <Tv className="w-5 h-5" />
            </Link>

            {/* 2. Games Catalog */}
            <Link
              href="/customer/games"
              title="Browse Games"
              className={`p-3 rounded-xl transition-all duration-200 ${
                pathname === '/customer/games'
                  ? 'bg-[#F25623] text-white shadow-md shadow-[#F25623]/30'
                  : 'text-[#DEDEDE]/70 hover:text-white hover:bg-[#2A2A2A]'
              }`}
            >
              <Gamepad2 className="w-5 h-5" />
            </Link>

            {/* 3. Cafe Menu */}
            <Link
              href="/customer/menu"
              title="Cafe Menu"
              className={`p-3 rounded-xl transition-all duration-200 ${
                pathname === '/customer/menu'
                  ? 'bg-[#F25623] text-white shadow-md shadow-[#F25623]/30'
                  : 'text-[#DEDEDE]/70 hover:text-white hover:bg-[#2A2A2A]'
              }`}
            >
              <Coffee className="w-5 h-5" />
            </Link>

            {/* Divider */}
            <div className="w-[1px] h-6 bg-[#4D4D4D]/70 mx-1" />

            {/* 4. Switch back to Admin */}
            <Link
              href="/admin"
              title="Staff / Admin Access"
              className="p-3 rounded-xl text-[#DEDEDE]/60 hover:text-[#F25623] hover:bg-[#2A2A2A] transition-all duration-200"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </Link>
          </>
        )}
      </nav>
    );
};
