'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Plus,
  ArrowLeftRight,
  Receipt,
  Settings,
  Clock,
  Coffee,
  User,
  Trash2,
  Check,
  Gamepad2,
  Sparkles
} from 'lucide-react';
import { Device, GameSession, PlayMode, SessionType } from '../../types';
import { useLounge } from '../../context/LoungeContext';
import { calculateSessionLiveStats, formatTimer, formatCurrency, formatMinutes } from '../../lib/calculations';

interface DeviceDetailsModalProps {
  device: Device;
  session?: GameSession;
  onClose: () => void;
  onAddOrder: (session: GameSession) => void;
  onTransfer: (session: GameSession) => void;
  onCheckout: (session: GameSession) => void;
}

export const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({
  device,
  session,
  onClose,
  onAddOrder,
  onTransfer,
  onCheckout,
}) => {
  const { games, startSession, deleteDevice, updateDeviceRates, updateDeviceGames, settings } = useLounge();

  // Active session stats
  const [stats, setStats] = useState(() =>
    session ? calculateSessionLiveStats(session, undefined, settings) : null
  );

  // Start Session state
  const [mode, setMode] = useState<PlayMode>('single');
  const [sessionType, setSessionType] = useState<SessionType>('open');
  const [plannedMinutes, setPlannedMinutes] = useState<number>(60);
  const [customerName, setCustomerName] = useState<string>('');

  // Settings tab inside details
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [singleRate, setSingleRate] = useState<number>(device.hourlyRateSingle);
  const [multiRate, setMultiRate] = useState<number>(device.hourlyRateMulti);
  const [selectedGames, setSelectedGames] = useState<string[]>(device.games || []);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!session || session.status !== 'active') {
      setStats(null);
      return;
    }

    const update = () => {
      setStats(calculateSessionLiveStats(session, undefined, settings));
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [session, settings]);

  const isBusy = device.status === 'busy' && !!session;
  const isAvailable = !isBusy && device.status !== 'maintenance';

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    startSession({
      deviceId: device.id,
      mode,
      sessionType,
      plannedMinutes: sessionType === 'fixed' ? plannedMinutes : undefined,
      customerName: customerName.trim() || undefined,
    });
    onClose();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeviceRates(device.id, singleRate, multiRate);
    updateDeviceGames(device.id, selectedGames);
    setIsSettingsOpen(false);
  };

  const handleDeleteDevice = () => {
    deleteDevice(device.id);
    onClose();
  };

  // Lock background scroll while modal is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const devGames = games.filter((g) => device.games.includes(g.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md max-h-[85vh] flex flex-col bg-[#1E1E1E] border border-[#4D4D4D] rounded-3xl shadow-2xl overflow-hidden text-[#DEDEDE]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#4D4D4D]/70 bg-[#242424]/60">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">{device.name}</h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#2E2E2E] border border-[#4D4D4D] text-[#DEDEDE] font-semibold">
                {device.type === 'VIP_ROOM' ? (device.vipConsoleType ? `VIP • ${device.vipConsoleType}` : 'VIP') : device.type}
              </span>
            </div>
            <p className="text-xs text-[#8C8C8C] mt-0.5">{device.notes || 'Gaming Console'}</p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-2 rounded-xl transition-colors ${
                isSettingsOpen ? 'bg-[#F25623] text-white' : 'text-[#DEDEDE] hover:bg-[#2A2A2A]'
              }`}
              title="Device Rates & Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#DEDEDE] hover:text-white hover:bg-[#2A2A2A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* SETTINGS VIEW (IF TOGGLED) */}
          {isSettingsOpen ? (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="text-xs font-semibold text-[#DEDEDE]">Device Hourly Rates & Settings:</div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-[#242424] border border-[#4D4D4D]">
                  <label className="block text-[11px] text-[#8C8C8C] mb-1">Single Rate (EGP/h):</label>
                  <input
                    type="number"
                    min="1"
                    value={singleRate}
                    onChange={(e) => setSingleRate(Number(e.target.value))}
                    className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-[#242424] border border-[#4D4D4D]">
                  <label className="block text-[11px] text-[#8C8C8C] mb-1">Multi Rate (EGP/h):</label>
                  <input
                    type="number"
                    min="1"
                    value={multiRate}
                    onChange={(e) => setMultiRate(Number(e.target.value))}
                    className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#DEDEDE] mb-2">
                  Installed Games ({selectedGames.length}):
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto border border-[#4D4D4D] rounded-2xl p-2 bg-[#242424]">
                  {games.map((g) => {
                    const isSelected = selectedGames.includes(g.id);
                    return (
                      <label
                        key={g.id}
                        className={`p-2 rounded-xl flex items-center justify-between text-xs cursor-pointer ${
                          isSelected ? 'bg-[#2E2E2E] text-white border border-[#4D4D4D]' : 'text-[#8C8C8C] hover:text-[#DEDEDE]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedGames(
                                isSelected
                                  ? selectedGames.filter((id) => id !== g.id)
                                  : [...selectedGames, g.id]
                              );
                            }}
                            className="rounded bg-[#171717] border-[#4D4D4D] text-[#F25623] focus:ring-0"
                          />
                          <span>{g.title}</span>
                        </div>
                        <span className="text-[10px] text-[#8C8C8C]">{g.psVersion}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-semibold shadow-md shadow-[#F25623]/25 transition-colors"
              >
                Save Device Settings
              </button>

              <div className="pt-2 border-t border-[#4D4D4D]/60">
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full py-2 rounded-full border border-rose-900/60 bg-rose-950/30 text-rose-400 hover:bg-rose-950/60 text-xs font-medium transition-colors"
                  >
                    Delete Console
                  </button>
                ) : (
                  <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-center space-y-2">
                    <p className="text-xs text-rose-300 font-medium">Delete {device.name} permanently?</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-1.5 rounded-full bg-[#2A2A2A] text-xs text-[#DEDEDE]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteDevice}
                        className="flex-1 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-xs text-white font-semibold"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          ) : isBusy && session && stats ? (
            /* ACTIVE SESSION VIEW */
            <div className="space-y-4">
              
              {/* Customer & Play Mode banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#242424] border border-[#4D4D4D] text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#F25623]" />
                  <span className="font-semibold text-white">{session.customerName || 'Walk-in Customer'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2E2E2E] text-[#DEDEDE] font-medium text-[11px] border border-[#4D4D4D]/60">
                    {session.mode === 'multi' ? 'Multiplayer' : 'Single Player'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2E2E2E] text-[#DEDEDE] font-medium text-[11px] border border-[#4D4D4D]/60">
                    {session.sessionType === 'fixed' ? `${session.plannedMinutes}m` : 'Open'}
                  </span>
                </div>
              </div>

              {/* Live Timer Display */}
              <div className="p-5 rounded-3xl bg-[#242424] border border-[#4D4D4D]/80 text-center space-y-1 relative overflow-hidden">
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#8C8C8C] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#F25623] animate-pulse" />
                  <span>{session.sessionType === 'fixed' ? 'Remaining Time' : 'Elapsed Time'}</span>
                </div>
                <div className="text-3xl font-mono font-black text-white tracking-wider">
                  {session.sessionType === 'fixed'
                    ? stats.isOvertime
                      ? `+${formatTimer(stats.elapsedSeconds - (session.plannedMinutes || 0) * 60)}`
                      : formatTimer(stats.remainingSeconds)
                    : formatTimer(stats.elapsedSeconds)}
                </div>
                {session.sessionType === 'fixed' && (
                  <span className="text-[11px] text-[#8C8C8C] block pt-1">
                    Elapsed: {formatMinutes(stats.exactMinutes)} / {session.plannedMinutes}m
                  </span>
                )}
              </div>

              {/* Cost & Orders Breakdown */}
              <div className="p-4 rounded-2xl bg-[#242424] border border-[#4D4D4D] space-y-2.5 text-xs">
                <div className="flex justify-between text-[#8C8C8C]">
                  <span>Gaming Time Cost:</span>
                  <span className="font-semibold text-white">{formatCurrency(stats.timeCost)}</span>
                </div>
                <div className="flex justify-between text-[#8C8C8C]">
                  <span>Cafe Orders ({session.orders.length} items):</span>
                  <span className="font-semibold text-white">{formatCurrency(stats.ordersCost)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#4D4D4D]/60">
                  <span>Current Total:</span>
                  <span className="text-[#F25623] text-base">{formatCurrency(stats.grandTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => onAddOrder(session)}
                  className="py-3 px-4 rounded-2xl bg-[#2A2A2A] hover:bg-[#333333] border border-[#4D4D4D]/60 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#F25623]" />
                  <span>Add Cafe Order</span>
                </button>

                <button
                  onClick={() => onTransfer(session)}
                  className="py-3 px-4 rounded-2xl bg-[#2A2A2A] hover:bg-[#333333] border border-[#4D4D4D]/60 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeftRight className="w-4 h-4 text-[#8C8C8C]" />
                  <span>Transfer Device</span>
                </button>
              </div>

              <button
                onClick={() => onCheckout(session)}
                className="w-full py-3.5 rounded-2xl bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#F25623]/25 transition-colors"
              >
                <Receipt className="w-4 h-4" />
                <span>Checkout & End Session ({formatCurrency(stats.grandTotal)})</span>
              </button>

            </div>
          ) : (
            /* AVAILABLE: START NEW SESSION VIEW */
            <form onSubmit={handleStartSession} className="space-y-4">
              <div className="text-xs font-semibold text-[#DEDEDE]">Start a New Gaming Session:</div>

              {/* Mode Select */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('single')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    mode === 'single'
                      ? 'bg-[#F25623] text-white border-[#F25623] font-bold shadow-md shadow-[#F25623]/20'
                      : 'bg-[#242424] border-[#4D4D4D] text-[#8C8C8C] hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">Single</div>
                  <div className={`text-[11px] mt-0.5 ${mode === 'single' ? 'text-white/80' : 'text-[#8C8C8C]'}`}>
                    {device.hourlyRateSingle} EGP/h
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('multi')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    mode === 'multi'
                      ? 'bg-[#F25623] text-white border-[#F25623] font-bold shadow-md shadow-[#F25623]/20'
                      : 'bg-[#242424] border-[#4D4D4D] text-[#8C8C8C] hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">Multiplayer</div>
                  <div className={`text-[11px] mt-0.5 ${mode === 'multi' ? 'text-white/80' : 'text-[#8C8C8C]'}`}>
                    {device.hourlyRateMulti} EGP/h
                  </div>
                </button>
              </div>

              {/* Session Type */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSessionType('open')}
                  className={`py-2.5 rounded-2xl border text-xs font-medium transition-all ${
                    sessionType === 'open'
                      ? 'bg-[#2E2E2E] text-white border-[#F25623] font-bold'
                      : 'bg-[#242424] border-[#4D4D4D] text-[#8C8C8C] hover:text-white'
                  }`}
                >
                  Open Time
                </button>

                <button
                  type="button"
                  onClick={() => setSessionType('fixed')}
                  className={`py-2.5 rounded-2xl border text-xs font-medium transition-all ${
                    sessionType === 'fixed'
                      ? 'bg-[#2E2E2E] text-white border-[#F25623] font-bold'
                      : 'bg-[#242424] border-[#4D4D4D] text-[#8C8C8C] hover:text-white'
                  }`}
                >
                  Fixed Time
                </button>
              </div>

              {sessionType === 'fixed' && (
                <div className="p-3 rounded-2xl bg-[#242424] border border-[#4D4D4D] space-y-2">
                  <div className="text-[11px] text-[#8C8C8C] font-medium">Select Duration:</div>
                  <div className="grid grid-cols-4 gap-1.5 text-xs">
                    {[30, 60, 90, 120].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setPlannedMinutes(mins)}
                        className={`py-1.5 rounded-xl border font-medium ${
                          plannedMinutes === mins
                            ? 'bg-[#F25623] text-white border-[#F25623]'
                            : 'bg-[#2A2A2A] border-[#4D4D4D] text-[#DEDEDE] hover:text-white'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-[#8C8C8C] mb-1">Customer Name (Optional):</label>
                <input
                  type="text"
                  placeholder="Customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#242424] border border-[#4D4D4D] text-white text-xs focus:outline-none focus:border-[#F25623]"
                />
              </div>

              {/* Installed Games preview */}
              <div className="pt-2 border-t border-[#4D4D4D]/60">
                <div className="text-[11px] text-[#8C8C8C] font-medium mb-1.5">
                  Available Games ({devGames.length}):
                </div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {devGames.map((g) => (
                    <span
                      key={g.id}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#242424] border border-[#4D4D4D] text-[#DEDEDE]"
                    >
                      {g.title}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#F25623]/25 transition-colors mt-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Session</span>
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
