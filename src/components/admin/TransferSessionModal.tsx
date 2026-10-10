'use client';

import React, { useState } from 'react';
import { X, ArrowLeftRight, Check } from 'lucide-react';
import { GameSession } from '../../types';
import { useLounge } from '../../context/LoungeContext';

interface TransferSessionModalProps {
  session: GameSession;
  onClose: () => void;
}

export const TransferSessionModal: React.FC<TransferSessionModalProps> = ({ session, onClose }) => {
  const { devices, transferSession } = useLounge();
  const [targetDeviceId, setTargetDeviceId] = useState<string>('');

  const availableDevices = devices.filter(
    (d) => d.status === 'available' && d.id !== session.deviceId
  );

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDeviceId) return;
    transferSession(session.id, targetDeviceId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl overflow-hidden text-[#DEDEDE]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#4D4D4D]/70 bg-[#242424]/60">
          <div>
            <h2 className="text-base font-bold text-white">Transfer Session</h2>
            <p className="text-xs text-[#8C8C8C] mt-0.5">{session.deviceName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#DEDEDE] hover:text-white p-1.5 rounded-xl hover:bg-[#2A2A2A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleTransfer} className="p-6 space-y-4">
          <p className="text-xs text-[#8C8C8C]">
            Select an available device to move the active timer and orders to.
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#DEDEDE] mb-2">
              Available Devices:
            </label>

            {availableDevices.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#242424] border border-[#4D4D4D] text-[#8C8C8C] text-xs text-center">
                No other devices are currently available
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {availableDevices.map((dev) => (
                  <label
                    key={dev.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                      targetDeviceId === dev.id
                        ? 'border-[#F25623] bg-[#242424] text-white shadow-sm shadow-[#F25623]/20'
                        : 'border-[#4D4D4D] hover:bg-[#242424] text-[#DEDEDE]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="targetDevice"
                        value={dev.id}
                        checked={targetDeviceId === dev.id}
                        onChange={(e) => setTargetDeviceId(e.target.value)}
                        className="text-[#F25623] focus:ring-0"
                      />
                      <div>
                        <div className="text-xs font-semibold text-white">{dev.name}</div>
                        <div className="text-[11px] text-[#8C8C8C]">{dev.type}</div>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-[#F25623]">
                      {session.mode === 'single' ? dev.hourlyRateSingle : dev.hourlyRateMulti} EGP/h
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!targetDeviceId}
              className={`w-full py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
                targetDeviceId
                  ? 'bg-[#F25623] hover:bg-[#E04816] text-white shadow-md shadow-[#F25623]/25'
                  : 'bg-[#242424] text-[#8C8C8C]/50 border border-[#4D4D4D]/40 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Confirm Transfer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
