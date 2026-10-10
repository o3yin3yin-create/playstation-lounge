'use client';

import React, { useState } from 'react';
import { X, Play, Clock, User, Phone } from 'lucide-react';
import { Device, PlayMode, SessionType } from '../../types';
import { useLounge } from '../../context/LoungeContext';

interface StartSessionModalProps {
  device: Device;
  onClose: () => void;
}

export const StartSessionModal: React.FC<StartSessionModalProps> = ({ device, onClose }) => {
  const { startSession } = useLounge();
  const [mode, setMode] = useState<PlayMode>('single');
  const [sessionType, setSessionType] = useState<SessionType>('open');
  const [plannedMinutes, setPlannedMinutes] = useState<number>(60);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  const quickTimes = [
    { label: '30 mins', minutes: 30 },
    { label: '45 mins', minutes: 45 },
    { label: '1 hour (60m)', minutes: 60 },
    { label: '90 mins', minutes: 90 },
    { label: '2 hours (120m)', minutes: 120 },
  ];

  const currentRate = mode === 'single' ? device.hourlyRateSingle : device.hourlyRateMulti;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startSession({
      deviceId: device.id,
      mode,
      sessionType,
      plannedMinutes: sessionType === 'fixed' ? plannedMinutes : undefined,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl overflow-hidden text-[#DEDEDE]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#4D4D4D]/60 bg-[#242424]/60">
          <div>
            <h2 className="text-base font-bold text-white">Start New Session</h2>
            <p className="text-xs text-[#8C8C8C] mt-0.5">{device.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8C8C8C] hover:text-white p-1.5 rounded-xl hover:bg-[#2A2A2A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Play Mode */}
          <div>
            <label className="block text-xs font-semibold text-[#DEDEDE] mb-2">Play Mode:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('single')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  mode === 'single'
                    ? 'border-[#F25623] bg-[#F25623] text-white shadow-sm shadow-[#F25623]/25'
                    : 'border-[#4D4D4D] bg-[#242424] text-[#8C8C8C] hover:text-white hover:bg-[#2A2A2A]'
                }`}
              >
                <div className="text-xs font-bold">Single</div>
                <div className={`text-[11px] mt-1 ${mode === 'single' ? 'text-white/80' : 'text-[#8C8C8C]'}`}>
                  {device.hourlyRateSingle} EGP / hour
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('multi')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  mode === 'multi'
                    ? 'border-[#F25623] bg-[#F25623] text-white shadow-sm shadow-[#F25623]/25'
                    : 'border-[#4D4D4D] bg-[#242424] text-[#8C8C8C] hover:text-white hover:bg-[#2A2A2A]'
                }`}
              >
                <div className="text-xs font-bold">Multi</div>
                <div className={`text-[11px] mt-1 ${mode === 'multi' ? 'text-white/80' : 'text-[#8C8C8C]'}`}>
                  {device.hourlyRateMulti} EGP / hour
                </div>
              </button>
            </div>
          </div>

          {/* Session Type */}
          <div>
            <label className="block text-xs font-semibold text-[#DEDEDE] mb-2">Session Timing:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSessionType('open')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  sessionType === 'open'
                    ? 'border-[#F25623] bg-[#F25623] text-white shadow-sm shadow-[#F25623]/25'
                    : 'border-[#4D4D4D] bg-[#242424] text-[#8C8C8C] hover:text-white hover:bg-[#2A2A2A]'
                }`}
              >
                Open Time
              </button>

              <button
                type="button"
                onClick={() => setSessionType('fixed')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  sessionType === 'fixed'
                    ? 'border-[#F25623] bg-[#F25623] text-white shadow-sm shadow-[#F25623]/25'
                    : 'border-[#4D4D4D] bg-[#242424] text-[#8C8C8C] hover:text-white hover:bg-[#2A2A2A]'
                }`}
              >
                Fixed Time
              </button>
            </div>
          </div>

          {/* Fixed Time Selection */}
          {sessionType === 'fixed' && (
            <div className="bg-[#242424] p-3.5 rounded-2xl border border-[#4D4D4D] space-y-2.5">
              <div className="text-xs text-[#8C8C8C] font-semibold">Choose duration:</div>
              <div className="grid grid-cols-3 gap-2">
                {quickTimes.map((t) => (
                  <button
                    key={t.minutes}
                    type="button"
                    onClick={() => setPlannedMinutes(t.minutes)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                      plannedMinutes === t.minutes
                        ? 'border-[#F25623] bg-[#F25623] text-white'
                        : 'border-[#4D4D4D] bg-[#1E1E1E] text-[#8C8C8C] hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="space-y-3 pt-2 border-t border-[#4D4D4D]/60">
            <div>
              <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Customer Name (Optional):</label>
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs placeholder-[#8C8C8C] focus:border-[#F25623] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Mobile Number (Optional):</label>
              <input
                type="tel"
                placeholder="01012345678"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs placeholder-[#8C8C8C] focus:border-[#F25623] focus:outline-none"
              />
            </div>
          </div>

          {/* Rate Summary */}
          <div className="flex items-center justify-between text-xs py-2.5 px-4 rounded-xl bg-[#242424] border border-[#4D4D4D]/60 text-[#8C8C8C]">
            <span>Applied Hourly Rate:</span>
            <span className="font-bold text-[#F25623] text-sm">{currentRate} EGP</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#F25623]/25 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Timer &amp; Begin Session</span>
          </button>
        </form>
      </div>
    </div>
  );
};
