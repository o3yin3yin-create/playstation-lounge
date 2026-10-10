'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Gamepad2, X } from 'lucide-react';
import { useLounge } from '../../context/LoungeContext';
import { calculateSessionLiveStats, formatMinutes } from '../../lib/calculations';
import { Device } from '../../types';

export const CustomerDeviceGrid: React.FC = () => {
  const { devices, sessions, games, settings } = useLounge();
  const [selectedDeviceModal, setSelectedDeviceModal] = useState<Device | null>(null);

  // Live ticking for timers
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Lock scroll when modal is open to prevent background bleed
  useEffect(() => {
    if (selectedDeviceModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedDeviceModal]);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col space-y-4 text-[#DEDEDE]">
      
      {/* Top Header Bar: Big bold "Clash." in white with orange dot */}
      <div className="flex items-center justify-between px-2 py-1">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white select-none flex items-baseline">
          Clash<span className="text-[#F25623] ml-0.5">.</span>
        </h1>
      </div>

      {/* Outer Curved Container matching Admin Screen */}
      <div className="w-full border border-[#4D4D4D]/60 rounded-3xl p-4 sm:p-5 bg-[#1E1E1E]/50 backdrop-blur-md min-h-[75vh] flex flex-col space-y-3 shadow-xl">
        
        {/* Stack of Device Capsules / Pills */}
        {devices.map((device) => {
          const session = sessions.find((s) => s.deviceId === device.id && s.status === 'active');
          const isBusy = device.status === 'busy' && !!session;
          const stats = session ? calculateSessionLiveStats(session, undefined, settings) : null;
          const isVip = device.type === 'VIP_ROOM';

          return (
            <div
              key={device.id}
              onClick={() => setSelectedDeviceModal(device)}
              className={`w-full rounded-2xl border p-4 cursor-pointer transition-all duration-200 active:scale-[0.985] group ${
                isBusy
                  ? 'bg-[#222222] border-[#F25623]/80 shadow-md shadow-[#F25623]/10 hover:border-[#F25623]'
                  : device.status === 'maintenance'
                  ? 'bg-[#141414] border-[#2E2E2E]/60 opacity-65'
                  : 'bg-[#161616]/90 border-[#2A2A2A] hover:bg-[#1C1C1C] hover:border-[#3E3E3E]'
              }`}
            >
              {isBusy && session && stats ? (
                /* IN USE: Two Dedicated Lines */
                <div className="flex flex-col gap-2.5 w-full">
                  {/* Row 1: Pulsing Dot + Device Name + Glowing VIP Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F25623] animate-pulse shrink-0 shadow-[0_0_8px_#F25623]" />
                      <span className="font-bold text-sm sm:text-base text-white truncate">
                        {device.name}
                      </span>
                      {isVip && (
                        <span
                          className="text-[10px] tracking-widest px-2.5 py-0.5 rounded-full text-black font-black border border-white/40 shrink-0 badge-vip"
                          style={{
                            backgroundColor: 'var(--clash-primary)',
                            boxShadow: '0 0 14px var(--clash-primary-glow)',
                          }}
                        >
                          VIP
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F25623]/15 text-[#F25623] font-bold border border-[#F25623]/30 shrink-0">
                      In Session
                    </span>
                  </div>

                  {/* Row 2: Live Timer */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#4D4D4D]/40 text-xs">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-white">
                      <Clock className="w-3.5 h-3.5 text-[#F25623]" />
                      <span>{formatMinutes(stats.exactMinutes)}</span>
                      {session.sessionType === 'fixed' && (
                        <span className="text-[11px] text-[#8C8C8C] font-normal font-sans ml-1">
                          • {stats.isOvertime ? 'Ending soon' : `${stats.remainingMinutes}m left`}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#8C8C8C] group-hover:text-white transition-colors">
                      View Games →
                    </span>
                  </div>
                </div>
              ) : device.status === 'maintenance' ? (
                /* MAINTENANCE */
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-amber-500/70 shrink-0" />
                    <span className="font-medium text-sm sm:text-base text-[#777777] truncate">
                      {device.name}
                    </span>
                    {isVip && (
                      <span className="text-[10px] tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold shrink-0">
                        VIP
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-amber-500/80 font-medium px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 shrink-0">
                    Maintenance
                  </span>
                </div>
              ) : (
                /* AVAILABLE: Dimmed Minimal Capsule with Rate */
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#333333] shrink-0" />
                    <span className="font-medium text-sm sm:text-base text-[#8C8C8C] group-hover:text-[#DEDEDE] truncate transition-colors">
                      {device.name}
                    </span>
                    {isVip && (
                      <span
                        className="text-[10px] tracking-widest px-2.5 py-0.5 rounded-full text-black font-black border border-white/40 shrink-0 badge-vip"
                        style={{
                          backgroundColor: 'var(--clash-primary)',
                          boxShadow: '0 0 14px var(--clash-primary-glow)',
                        }}
                      >
                        VIP
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-[#555555] group-hover:text-[#8C8C8C] font-medium transition-colors">
                      {device.hourlyRateSingle === device.hourlyRateMulti ? (
                        `${device.hourlyRateSingle} EGP/h`
                      ) : (
                        <>
                          <span className="hidden sm:inline">Single: </span>{device.hourlyRateSingle} <span className="text-[#444444]">•</span> <span className="hidden sm:inline">Multi: </span>{device.hourlyRateMulti} EGP/h
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: ALL GAMES FOR DEVICE */}
      {selectedDeviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md max-h-[85vh] flex flex-col bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl p-6 space-y-4 text-[#DEDEDE] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#4D4D4D]/60">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{selectedDeviceModal.name}</h3>
                {selectedDeviceModal.type === 'VIP_ROOM' && (
                  <span
                    className="text-[10px] tracking-widest px-2 py-0.5 rounded-full text-black font-black border border-white/40 badge-vip"
                    style={{
                      backgroundColor: 'var(--clash-primary)',
                      boxShadow: '0 0 10px var(--clash-primary-glow)',
                    }}
                  >
                    VIP
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedDeviceModal(null)}
                className="text-[#8C8C8C] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rates Banner */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#242424] border border-[#4D4D4D]/60 text-center">
                <span className="block text-[#8C8C8C] text-[11px] mb-0.5">Single</span>
                <span className="font-bold text-white text-sm">
                  {selectedDeviceModal.hourlyRateSingle} <span className="text-[10px] font-normal text-[#8C8C8C]">EGP/h</span>
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#242424] border border-[#4D4D4D]/60 text-center">
                <span className="block text-[#8C8C8C] text-[11px] mb-0.5">Multiplayer</span>
                <span className="font-bold text-white text-sm">
                  {selectedDeviceModal.hourlyRateMulti} <span className="text-[10px] font-normal text-[#8C8C8C]">EGP/h</span>
                </span>
              </div>
            </div>

            {/* Installed Games List */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#8C8C8C] mb-1 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-[#F25623]" />
                <span>Installed Games ({selectedDeviceModal.games.length}):</span>
              </div>
              <div className="overflow-y-auto max-h-72 space-y-2 pr-1">
                {games
                  .filter((g) => selectedDeviceModal.games.includes(g.id))
                  .map((g) => (
                    <div
                      key={g.id}
                      className="p-3 rounded-2xl bg-[#242424] border border-[#4D4D4D]/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{g.title}</div>
                      </div>
                      <span className="text-[#8C8C8C] text-[11px] bg-[#1E1E1E] px-2 py-0.5 rounded-full border border-[#4D4D4D]/40">
                        {g.playersCount}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedDeviceModal(null)}
              className="w-full py-2.5 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-bold shadow-md shadow-[#F25623]/25 transition-all active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
