'use client';

import React, { useState, useEffect } from 'react';
import { useLounge } from '../../context/LoungeContext';
import { AuthLockScreen } from './AuthLockScreen';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const { currentRole } = useLounge();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR or initial mount before reading localStorage, render neutral dark loader
  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#F25623] border-t-transparent animate-spin" />
      </div>
    );
  }

  // If not logged in as Admin or IT, display the lock screen
  if (currentRole !== 'admin' && currentRole !== 'it') {
    return <AuthLockScreen />;
  }

  // Authenticated
  return <>{children}</>;
};
