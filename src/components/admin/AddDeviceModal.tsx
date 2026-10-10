'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useLounge } from '../../context/LoungeContext';
import { ConsoleType } from '../../types';

interface AddDeviceModalProps {
  onClose: () => void;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ onClose }) => {
  const { games, addDevice } = useLounge();
  const [name, setName] = useState('');
  const [type, setType] = useState<ConsoleType>('PS5');
  const [vipConsoleType, setVipConsoleType] = useState<'PS5' | 'PS4'>('PS5');
  const [singleRate, setSingleRate] = useState<number>(50);
  const [multiRate, setMultiRate] = useState<number>(70);
  const [controllersCount, setControllersCount] = useState<number>(2);
  const [notes, setNotes] = useState('');
  const [selectedGames, setSelectedGames] = useState<string[]>([]);

  const toggleGame = (gameId: string) => {
    if (selectedGames.includes(gameId)) {
      setSelectedGames(selectedGames.filter((id) => id !== gameId));
    } else {
      setSelectedGames([...selectedGames, gameId]);
    }
  };

  const selectAllGames = () => {
    if (selectedGames.length === games.length) {
      setSelectedGames([]);
    } else {
      setSelectedGames(games.map((g) => g.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addDevice({
      name: name.trim(),
      type,
      vipConsoleType: type === 'VIP_ROOM' ? vipConsoleType : undefined,
      hourlyRateSingle: singleRate,
      hourlyRateMulti: multiRate,
      controllersCount,
      notes: notes.trim() || '4K Gaming TV',
      games: selectedGames,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-md max-h-[85vh] flex flex-col bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl overflow-hidden text-[#DEDEDE]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#4D4D4D]/70 bg-[#242424]/60">
          <div>
            <h2 className="text-base font-bold text-white">Add New Device</h2>
            <p className="text-xs text-[#8C8C8C] mt-0.5">Register a console in Clash</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#DEDEDE] hover:text-white p-1.5 rounded-xl hover:bg-[#2A2A2A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Device Name */}
          <div>
            <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Device Name:</label>
            <input
              type="text"
              required
              placeholder="e.g. Device 05 or VIP Room 2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-2xl bg-[#242424] border border-[#4D4D4D] text-white text-xs focus:outline-none focus:border-[#F25623]"
            />
          </div>

          {/* Type & VIP Console / Controllers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Console Type:</label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as ConsoleType;
                  setType(newType);
                  if (newType === 'PS4') {
                    setSingleRate(35);
                    setMultiRate(50);
                  } else if (newType === 'VIP_ROOM') {
                    setSingleRate(80);
                    setMultiRate(120);
                  } else {
                    setSingleRate(50);
                    setMultiRate(70);
                  }
                }}
                className="w-full p-2.5 rounded-2xl bg-[#242424] border border-[#4D4D4D] text-white text-xs focus:outline-none focus:border-[#F25623]"
              >
                <option value="PS5">PlayStation 5</option>
                <option value="PS4">PlayStation 4</option>
                <option value="VIP_ROOM">VIP Room</option>
              </select>
            </div>

            {type === 'VIP_ROOM' ? (
              <div>
                <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Console in VIP:</label>
                <select
                  value={vipConsoleType}
                  onChange={(e) => setVipConsoleType(e.target.value as 'PS5' | 'PS4')}
                  className="w-full p-2.5 rounded-2xl bg-[#242424] border border-[#4D4D4D] text-white text-xs focus:outline-none focus:border-[#F25623]"
                >
                  <option value="PS5">PlayStation 5</option>
                  <option value="PS4">PlayStation 4</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Controllers:</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  required
                  value={controllersCount}
                  onChange={(e) => setControllersCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-2xl bg-[#242424] border border-[#4D4D4D] text-white text-xs font-semibold focus:outline-none focus:border-[#F25623]"
                />
              </div>
            )}
          </div>

          {/* Rates (Single & Multi) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Single Rate (EGP/h):</label>
              <input
                type="number"
                min="1"
                required
                value={singleRate}
                onChange={(e) => setSingleRate(Number(e.target.value))}
                className="w-full p-2.5 rounded-2xl bg-[#242424] border border-[#4D4D4D] text-white text-sm font-bold focus:outline-none focus:border-[#F25623]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Multi Rate (EGP/h):</label>
              <input
                type="number"
                min="1"
                required
                value={multiRate}
                onChange={(e) => setMultiRate(Number(e.target.value))}
                className="w-full p-2.5 rounded-2xl bg-[#242424] border border-[#4D4D4D] text-white text-sm font-bold focus:outline-none focus:border-[#F25623]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Screen / Room Specs:</label>
            <input
              type="text"
              placeholder="e.g. 55 inch 4K HDR TV"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-2xl bg-[#242424] border border-[#4D4D4D] text-white text-xs focus:outline-none focus:border-[#F25623]"
            />
          </div>

          {/* Installed Games Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#DEDEDE]">
                Installed Games ({selectedGames.length}):
              </label>
              <button
                type="button"
                onClick={selectAllGames}
                className="text-xs text-[#8C8C8C] hover:text-white font-medium"
              >
                {selectedGames.length === games.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto border border-[#4D4D4D] rounded-2xl p-2 bg-[#242424]">
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
                        onChange={() => toggleGame(g.id)}
                        className="rounded bg-[#171717] border-[#4D4D4D] text-[#F25623] focus:ring-0"
                      />
                      <span>{g.title}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-[#4D4D4D] bg-[#242424] text-[#8C8C8C] text-xs font-medium hover:text-white hover:bg-[#2E2E2E]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#F25623]/25 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Device</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
