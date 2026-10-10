'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, Palette } from 'lucide-react';
import { useLounge } from '../../context/LoungeContext';
import { ITControlModal } from './ITControlModal';
import { ThemeCustomizerModal } from './ThemeCustomizerModal';

export const AdminHeaderBar: React.FC = () => {
  const { currentRole, logout } = useLounge();
  const [showITModal, setShowITModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  return (
    <>
      <div className="w-full flex items-center justify-end gap-2 mb-3">
        {currentRole === 'it' && (
          <button
            onClick={() => setShowITModal(true)}
            className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-black shadow-sm flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all cursor-pointer badge-it"
            style={{ backgroundColor: 'var(--clash-primary)' }}
            title="Open IT Master Control Panel"
          >
            <ShieldCheck className="w-3 h-3 text-black" />
            <span>IT Master</span>
          </button>
        )}
        {currentRole === 'admin' && (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#242424] border border-[#4D4D4D] text-[#8C8C8C]">
            Admin
          </span>
        )}

        {/* Theme & Colors button */}
        <button
          onClick={() => setShowThemeModal(true)}
          className="p-1.5 text-[#8C8C8C] hover:text-[#F25623] hover:bg-[#242424] rounded-lg transition-colors"
          title="Customize System Colors & Theme"
        >
          <Palette className="w-4 h-4" />
        </button>

        {/* Lock button */}
        <button
          onClick={logout}
          className="p-1.5 text-[#8C8C8C] hover:text-rose-400 hover:bg-[#242424] rounded-lg transition-colors"
          title="Lock System / Logout"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>

      {showITModal && <ITControlModal onClose={() => setShowITModal(false)} />}
      {showThemeModal && <ThemeCustomizerModal onClose={() => setShowThemeModal(false)} />}
    </>
  );
};
