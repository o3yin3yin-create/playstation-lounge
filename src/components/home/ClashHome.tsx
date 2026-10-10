'use client';

import React, { useState } from 'react';
import { 
  Pencil,
  Coffee, 
  Clock,
  Sparkles,
  ShieldCheck,
  Lock,
  Palette
} from 'lucide-react';
import { useLounge } from '../../context/LoungeContext';
import { Device, GameSession } from '../../types';
import { calculateSessionLiveStats, formatMinutes } from '../../lib/calculations';
import { DeviceDetailsModal } from './DeviceDetailsModal';
import { AddOrderModal } from '../admin/AddOrderModal';
import { TransferSessionModal } from '../admin/TransferSessionModal';
import { CheckoutModal } from '../admin/CheckoutModal';
import { AddDeviceModal } from '../admin/AddDeviceModal';
import { ManageDevicesModal } from '../admin/ManageDevicesModal';
import { ITControlModal } from '../admin/ITControlModal';
import { ThemeCustomizerModal } from '../admin/ThemeCustomizerModal';

export const ClashHome: React.FC = () => {
  const { devices, sessions, settings, currentRole, logout } = useLounge();

  // Selected device for full details modal
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // Sub-modals from inside session
  const [addOrderSession, setAddOrderSession] = useState<GameSession | null>(null);
  const [transferSession, setTransferSession] = useState<GameSession | null>(null);
  const [checkoutSession, setCheckoutSession] = useState<GameSession | null>(null);

  // Top header actions
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [showManageDevicesModal, setShowManageDevicesModal] = useState(false);
  const [showITModal, setShowITModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Force live ticking for on-capsule timers
  const [, setTick] = useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#171717] text-[#DEDEDE] flex flex-col justify-start py-8 px-4 sm:px-6">
      
      {/* Centered Mobile/Tablet App Shell matching user's sketch */}
      <div className="w-full max-w-lg mx-auto flex flex-col space-y-4">
        
        {/* Top Header Bar: Big bold "Clash." in white with orange dot, clean pencil icon on right */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white select-none flex items-baseline">
              Clash<span className="text-[#F25623] ml-0.5">.</span>
            </h1>
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
          </div>

          <div className="flex items-center gap-2">
            {/* Theme & Colors button */}
            <button
              onClick={() => setShowThemeModal(true)}
              className="p-1.5 text-[#8C8C8C] hover:text-[#F25623] transition-transform active:scale-90"
              title="Customize System Colors & Theme"
            >
              <Palette className="w-4 h-4" />
            </button>

            {/* Lock / Logout button */}
            <button
              onClick={logout}
              className="p-1.5 text-[#8C8C8C] hover:text-rose-400 transition-transform active:scale-90"
              title="Lock System / Logout"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Pencil button: Manage Devices (Add, Edit, Delete) - clean without circle/border */}
            <button
              onClick={() => setShowManageDevicesModal(true)}
              className="p-1.5 text-[#F25623] hover:text-[#FFA07A] transition-transform active:scale-90"
              title="Manage Devices (Add, Edit, Delete)"
            >
              <Pencil className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Outer Curved Container from Sketch */}
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
                onClick={() => setSelectedDevice(device)}
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
                    {/* Row 1: Indicator + Name + Radiant Glowing VIP Badge (no PS5/PS4, no Single/Multi) */}
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

                      {session.orders.length > 0 && (
                        <span className="text-[11px] text-[#DEDEDE] flex items-center gap-1 shrink-0 bg-[#2A2A2A] px-2.5 py-0.5 rounded-full border border-[#4D4D4D]/50">
                          <Coffee className="w-3 h-3 text-[#F25623]" />
                          +{session.orders.length}
                        </span>
                      )}
                    </div>

                    {/* Row 2: Timer and Bill on a dedicated line of their own! */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#4D4D4D]/40 text-xs">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-white">
                        <Clock className="w-3.5 h-3.5 text-[#F25623]" />
                        <span>{formatMinutes(stats.exactMinutes)}</span>
                        {session.customerName && (
                          <span className="text-[11px] text-[#8C8C8C] font-normal font-sans ml-1">
                            • {session.customerName}
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-sm sm:text-base text-[#F25623]">
                        {stats.grandTotal.toFixed(0)} EGP
                      </div>
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
                  /* AVAILABLE (DIMMED, NO "Available" TAG, NO TYPE BADGE, GLOWING VIP IF VIP) */
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

          {devices.length === 0 && (
            <div className="text-center py-20 text-xs text-[#8C8C8C] flex flex-col items-center justify-center space-y-3">
              <p>No consoles added yet.</p>
              <button
                onClick={() => setShowAddDeviceModal(true)}
                className="px-4 py-2 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-semibold"
              >
                + Add Your First Console
              </button>
            </div>
          )}

        </div>

      </div>

      {/* MODALS */}
      {selectedDevice && (
        <DeviceDetailsModal
          device={selectedDevice}
          session={sessions.find((s) => s.deviceId === selectedDevice.id && s.status === 'active')}
          onClose={() => setSelectedDevice(null)}
          onAddOrder={(sess) => setAddOrderSession(sess)}
          onTransfer={(sess) => setTransferSession(sess)}
          onCheckout={(sess) => setCheckoutSession(sess)}
        />
      )}

      {addOrderSession && (
        <AddOrderModal
          session={addOrderSession}
          onClose={() => setAddOrderSession(null)}
        />
      )}

      {transferSession && (
        <TransferSessionModal
          session={transferSession}
          onClose={() => setTransferSession(null)}
        />
      )}

      {checkoutSession && (
        <CheckoutModal
          session={checkoutSession}
          onClose={() => setCheckoutSession(null)}
        />
      )}

      {showAddDeviceModal && (
        <AddDeviceModal
          onClose={() => setShowAddDeviceModal(false)}
        />
      )}

      {showManageDevicesModal && (
        <ManageDevicesModal
          onClose={() => setShowManageDevicesModal(false)}
          onAddNew={() => {
            setShowManageDevicesModal(false);
            setShowAddDeviceModal(true);
          }}
        />
      )}

      {showITModal && (
        <ITControlModal
          onClose={() => setShowITModal(false)}
        />
      )}

      {showThemeModal && (
        <ThemeCustomizerModal
          onClose={() => setShowThemeModal(false)}
        />
      )}

    </div>
  );
};
