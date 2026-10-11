'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, Palette, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useLounge } from '../../context/LoungeContext';
import { ITControlModal } from './ITControlModal';
import { ThemeCustomizerModal } from './ThemeCustomizerModal';

export const AdminHeaderBar: React.FC = () => {
  const { currentRole, logout, syncStatus, forceSync } = useLounge();
  const [showITModal, setShowITModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  return (
    <>
      <div className="w-full flex items-center justify-between gap-2 mb-3">
        {/* Left: Offline-First Sync Status Badge */}
        <div className="flex items-center gap-1.5">
          {syncStatus === 'synced' && (
            <span
              className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1"
              title="متصل سحابياً مع قاعدة بيانات Supabase - كل البيانات محفوظة 100%"
            >
              <Cloud className="w-3 h-3 text-emerald-400" />
              <span>سحابي متصل</span>
            </span>
          )}

          {syncStatus === 'syncing' && (
            <span
              className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1"
              title="جاري المزامنة مع السيرفر السحابي..."
            >
              <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
              <span>مزامنة...</span>
            </span>
          )}

          {syncStatus === 'offline' && (
            <button
              onClick={() => forceSync()}
              className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-600/60 text-zinc-300 flex items-center gap-1 hover:bg-zinc-700 transition-colors cursor-pointer"
              title="يعمل محلياً (Offline-First) - كل الفواتير والسيشنز محفوظة على جهازك - اضغط للمزامنة يدوياً"
            >
              <CloudOff className="w-3 h-3 text-zinc-400" />
              <span>وضع محلي (أوفلاين)</span>
            </button>
          )}
        </div>

        {/* Right: Role, Theme, Lock Controls */}
        <div className="flex items-center gap-2">
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
            className="p-1.5 text-[#8C8C8C] hover:text-[#F25623] hover:bg-[#242424] rounded-lg transition-colors cursor-pointer"
            title="Customize System Colors & Theme"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Lock button */}
          <button
            onClick={logout}
            className="p-1.5 text-[#8C8C8C] hover:text-rose-400 hover:bg-[#242424] rounded-lg transition-colors cursor-pointer"
            title="Lock System / Logout"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showITModal && <ITControlModal onClose={() => setShowITModal(false)} />}
      {showThemeModal && <ThemeCustomizerModal onClose={() => setShowThemeModal(false)} />}
    </>
  );
};
