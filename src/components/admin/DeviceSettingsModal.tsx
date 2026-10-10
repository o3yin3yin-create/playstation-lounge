'use client';

import React, { useState } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { Device } from '../../types';
import { useLounge } from '../../context/LoungeContext';

interface DeviceSettingsModalProps {
  device: Device;
  onClose: () => void;
}

export const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({ device, onClose }) => {
  const { games, updateDeviceRates, updateDeviceGames, deleteDevice } = useLounge();
  const [singleRate, setSingleRate] = useState<number>(device.hourlyRateSingle);
  const [multiRate, setMultiRate] = useState<number>(device.hourlyRateMulti);
  const [selectedGames, setSelectedGames] = useState<string[]>(device.games || []);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const toggleGame = (gameId: string) => {
    if (selectedGames.includes(gameId)) {
      setSelectedGames(selectedGames.filter((id) => id !== gameId));
    } else {
      setSelectedGames([...selectedGames, gameId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeviceRates(device.id, singleRate, multiRate);
    updateDeviceGames(device.id, selectedGames);
    onClose();
  };

  const handleDelete = () => {
    deleteDevice(device.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg max-h-[85vh] flex flex-col bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl overflow-hidden text-[#DEDEDE]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#4D4D4D]/60 bg-[#242424]/60">
          <div>
            <h2 className="text-base font-bold text-white">Device &amp; Pricing Settings</h2>
            <p className="text-xs text-[#8C8C8C] mt-0.5">{device.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8C8C8C] hover:text-white p-1.5 rounded-xl hover:bg-[#2A2A2A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Rates */}
          <div>
            <h4 className="text-xs font-semibold text-[#DEDEDE] mb-2">Hourly Rates (EGP):</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#242424] border border-[#4D4D4D]/60">
                <label className="block text-xs text-[#8C8C8C] mb-1">Single:</label>
                <input
                  type="number"
                  min="1"
                  value={singleRate}
                  onChange={(e) => setSingleRate(Number(e.target.value))}
                  className="w-full p-2 rounded-xl bg-[#1E1E1E] border border-[#4D4D4D] text-white font-bold text-sm focus:outline-none focus:border-[#F25623]"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#242424] border border-[#4D4D4D]/60">
                <label className="block text-xs text-[#8C8C8C] mb-1">Multi:</label>
                <input
                  type="number"
                  min="1"
                  value={multiRate}
                  onChange={(e) => setMultiRate(Number(e.target.value))}
                  className="w-full p-2 rounded-xl bg-[#1E1E1E] border border-[#4D4D4D] text-white font-bold text-sm focus:outline-none focus:border-[#F25623]"
                />
              </div>
            </div>
          </div>

          {/* Games Checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-[#DEDEDE]">
                Installed Games ({selectedGames.length} games):
              </h4>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto border border-[#4D4D4D]/60 rounded-2xl p-2.5 bg-[#242424]">
              {games.map((g) => {
                const isSelected = selectedGames.includes(g.id);
                return (
                  <label
                    key={g.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#1E1E1E] border-[#F25623] text-white'
                        : 'bg-transparent border-transparent text-[#8C8C8C] hover:bg-[#1E1E1E] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleGame(g.id)}
                        className="rounded accent-[#F25623]"
                      />
                      <span className="text-xs font-bold text-white">{g.title}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#F25623]/25 transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>

          {/* Delete Device Option */}
          <div className="pt-4 border-t border-[#4D4D4D]/60">
            {!showConfirmDelete ? (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="w-full py-2.5 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Device from Lounge</span>
              </button>
            ) : (
              <div className="p-4 bg-[#242424] rounded-2xl border border-rose-500/40 space-y-3 text-center">
                <p className="text-xs text-rose-400 font-bold">
                  Are you sure you want to permanently delete &quot;{device.name}&quot;?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(false)}
                    className="flex-1 py-2 rounded-full bg-[#1E1E1E] border border-[#4D4D4D] text-[#8C8C8C] hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};
