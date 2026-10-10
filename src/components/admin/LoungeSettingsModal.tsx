'use client';

import React, { useState } from 'react';
import { X, Sliders, ShieldCheck, Clock, Banknote } from 'lucide-react';
import { useLounge } from '../../context/LoungeContext';

interface LoungeSettingsModalProps {
  onClose: () => void;
}

export const LoungeSettingsModal: React.FC<LoungeSettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings } = useLounge();
  const [gracePeriod, setGracePeriod] = useState<number>(settings.gracePeriodMinutes ?? 5);
  const [minCharge, setMinCharge] = useState<number>(settings.minimumCharge ?? 15);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      gracePeriodMinutes: Math.max(0, gracePeriod),
      minimumCharge: Math.max(0, minCharge),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl overflow-hidden text-[#DEDEDE]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#4D4D4D]/70 bg-[#242424]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#F25623]/15 border border-[#F25623]/30 text-[#F25623]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Billing & Session Rules</h2>
              <p className="text-xs text-[#8C8C8C] mt-0.5">Grace period & minimum fee</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#DEDEDE] hover:text-white p-1.5 rounded-xl hover:bg-[#2A2A2A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          
          {/* Grace Period Card */}
          <div className="p-4 rounded-2xl bg-[#242424] border border-[#4D4D4D]/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F25623]" />
                <span>Grace Period (Minutes)</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="60"
                  required
                  value={gracePeriod}
                  onChange={(e) => setGracePeriod(Number(e.target.value))}
                  className="w-16 p-1.5 rounded-lg bg-[#1E1E1E] border border-[#4D4D4D] text-white font-mono font-bold text-center text-sm focus:outline-none focus:border-[#F25623]"
                />
                <span className="text-xs text-[#8C8C8C]">min</span>
              </div>
            </div>
            <p className="text-[11px] text-[#8C8C8C] leading-relaxed">
              If a customer leaves or cancels within this duration, gaming time cost is completely waived (0 EGP).
            </p>
          </div>

          {/* Minimum Charge Card */}
          <div className="p-4 rounded-2xl bg-[#242424] border border-[#4D4D4D]/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Banknote className="w-4 h-4 text-[#F25623]" />
                <span>Minimum Session Fee (EGP)</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="500"
                  required
                  value={minCharge}
                  onChange={(e) => setMinCharge(Number(e.target.value))}
                  className="w-20 p-1.5 rounded-lg bg-[#1E1E1E] border border-[#4D4D4D] text-white font-mono font-bold text-center text-sm focus:outline-none focus:border-[#F25623]"
                />
                <span className="text-xs text-[#8C8C8C]">EGP</span>
              </div>
            </div>
            <p className="text-[11px] text-[#8C8C8C] leading-relaxed">
              Minimum billing amount applied once the grace period passes, even if the calculated hourly fraction is lower.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-[#4D4D4D] bg-[#242424] text-[#8C8C8C] hover:text-white text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-bold shadow-md shadow-[#F25623]/25 transition-all active:scale-95"
            >
              {savedSuccess ? 'Saved!' : 'Save Rules'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
