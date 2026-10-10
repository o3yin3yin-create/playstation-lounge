'use client';

import React, { useState } from 'react';
import { X, Plus, Pencil, Trash2, Check, Tv, Sparkles, Gamepad2 } from 'lucide-react';
import { useLounge } from '../../context/LoungeContext';
import { Device, ConsoleType } from '../../types';

interface ManageDevicesModalProps {
  onClose: () => void;
  onAddNew: () => void;
}

export const ManageDevicesModal: React.FC<ManageDevicesModalProps> = ({ onClose, onAddNew }) => {
  const { devices, deleteDevice, updateDevice, games } = useLounge();

  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<ConsoleType>('PS5');
  const [editVipConsoleType, setEditVipConsoleType] = useState<'PS5' | 'PS4'>('PS5');
  const [editRateSingle, setEditRateSingle] = useState<number>(50);
  const [editRateMulti, setEditRateMulti] = useState<number>(70);
  const [editNotes, setEditNotes] = useState('');
  const [editGames, setEditGames] = useState<string[]>([]);

  const startEdit = (dev: Device) => {
    setEditingDevice(dev);
    setEditName(dev.name);
    setEditType(dev.type);
    setEditVipConsoleType(dev.vipConsoleType || 'PS5');
    setEditRateSingle(dev.hourlyRateSingle);
    setEditRateMulti(dev.hourlyRateMulti);
    setEditNotes(dev.notes || '');
    setEditGames(dev.games || []);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice || !editName.trim()) return;

    updateDevice(editingDevice.id, {
      name: editName.trim(),
      type: editType,
      vipConsoleType: editType === 'VIP_ROOM' ? editVipConsoleType : undefined,
      hourlyRateSingle: editRateSingle,
      hourlyRateMulti: editRateMulti,
      notes: editNotes.trim(),
      games: editGames,
    });

    setEditingDevice(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg max-h-[85vh] flex flex-col bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl overflow-hidden text-[#DEDEDE]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#4D4D4D]/70 bg-[#242424]/60">
          <div>
            <h2 className="text-base font-bold text-white">Manage Devices</h2>
            <p className="text-xs text-[#8C8C8C] mt-0.5">Add, edit, or remove consoles</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#DEDEDE] hover:text-white p-1.5 rounded-xl hover:bg-[#2A2A2A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* If Editing a Device */}
          {editingDevice ? (
            <form onSubmit={handleSaveEdit} className="space-y-4 bg-[#242424] p-5 rounded-2xl border border-[#4D4D4D]">
              <div className="flex items-center justify-between pb-2 border-b border-[#4D4D4D]/60">
                <span className="text-xs font-bold text-white">Edit: {editingDevice.name}</span>
                <button
                  type="button"
                  onClick={() => setEditingDevice(null)}
                  className="text-xs text-[#8C8C8C] hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Device Name:</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#1E1E1E] border border-[#4D4D4D] text-white text-xs focus:outline-none focus:border-[#F25623]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Type:</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as ConsoleType)}
                    className="w-full p-2.5 rounded-xl bg-[#1E1E1E] border border-[#4D4D4D] text-white text-xs focus:outline-none focus:border-[#F25623]"
                  >
                    <option value="PS5">PlayStation 5</option>
                    <option value="PS4">PlayStation 4</option>
                    <option value="VIP_ROOM">VIP Room</option>
                  </select>
                </div>

                {editType === 'VIP_ROOM' ? (
                  <div>
                    <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Console in VIP:</label>
                    <select
                      value={editVipConsoleType}
                      onChange={(e) => setEditVipConsoleType(e.target.value as 'PS5' | 'PS4')}
                      className="w-full p-2.5 rounded-xl bg-[#1E1E1E] border border-[#4D4D4D] text-white text-xs focus:outline-none focus:border-[#F25623]"
                    >
                      <option value="PS5">PlayStation 5</option>
                      <option value="PS4">PlayStation 4</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Notes / TV:</label>
                    <input
                      type="text"
                      placeholder="e.g. 55 inch TV"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#1E1E1E] border border-[#4D4D4D] text-white text-xs focus:outline-none focus:border-[#F25623]"
                    />
                  </div>
                )}
              </div>

              {/* Rates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Single Rate (EGP/h):</label>
                  <input
                    type="number"
                    min="1"
                    value={editRateSingle}
                    onChange={(e) => setEditRateSingle(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#1E1E1E] border border-[#4D4D4D] text-white text-xs font-bold focus:outline-none focus:border-[#F25623]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Multi Rate (EGP/h):</label>
                  <input
                    type="number"
                    min="1"
                    value={editRateMulti}
                    onChange={(e) => setEditRateMulti(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#1E1E1E] border border-[#4D4D4D] text-white text-xs font-bold focus:outline-none focus:border-[#F25623]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Screen / Specs:</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2 rounded-xl bg-[#1E1E1E] border border-[#4D4D4D] text-white text-xs focus:outline-none focus:border-[#F25623]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDevice(null)}
                  className="flex-1 py-2.5 rounded-full bg-[#2E2E2E] text-xs text-[#DEDEDE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-bold shadow-md shadow-[#F25623]/25"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Top Action: Add New Device Button */}
              <button
                onClick={() => {
                  onClose();
                  onAddNew();
                }}
                className="w-full py-3 rounded-2xl bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#F25623]/25 transition-all active:scale-[0.99]"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Device</span>
              </button>

              {/* Devices List */}
              <div className="space-y-2 pt-2">
                {devices.map((device) => {
                  const isConfirmingDelete = deleteConfirmId === device.id;

                  return (
                    <div
                      key={device.id}
                      className="p-3.5 rounded-2xl bg-[#242424] border border-[#4D4D4D] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            device.status === 'busy'
                              ? 'bg-[#F25623]'
                              : device.status === 'maintenance'
                              ? 'bg-amber-500'
                              : 'bg-[#4D4D4D]'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white truncate">
                              {device.name}
                            </span>
                            {device.type === 'VIP_ROOM' ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F25623]/20 border border-[#F25623]/40 text-[#F25623] font-bold">
                                VIP {device.vipConsoleType ? `(${device.vipConsoleType})` : ''}
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2E2E2E] border border-[#4D4D4D]/60 text-[#DEDEDE] font-medium">
                                {device.type}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#8C8C8C] mt-0.5">
                            Single: {device.hourlyRateSingle} EGP • Multi: {device.hourlyRateMulti} EGP/h • {device.notes || 'Console'}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in">
                            <button
                              type="button"
                              onClick={() => {
                                deleteDevice(device.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 rounded-xl bg-[#2E2E2E] text-[#DEDEDE] text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(device)}
                              className="p-2 rounded-xl text-[#DEDEDE] hover:text-white hover:bg-[#2E2E2E] transition-colors"
                              title="Edit Console"
                            >
                              <Pencil className="w-3.5 h-3.5 text-[#F25623]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(device.id)}
                              className="p-2 rounded-xl text-[#8C8C8C] hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                              title="Delete Console"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {devices.length === 0 && (
                  <div className="text-center py-10 text-xs text-[#8C8C8C]">
                    No devices currently configured.
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#4D4D4D]/70 bg-[#242424]/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#2E2E2E] hover:bg-[#383838] text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
