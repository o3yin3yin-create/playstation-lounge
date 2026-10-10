'use client';

import React, { useState } from 'react';
import { Wrench, Plus, Check } from 'lucide-react';
import { useLounge } from '../../context/LoungeContext';
import { formatCurrency } from '../../lib/calculations';
import { MaintenanceItem } from '../../types';

export const MaintenanceView: React.FC = () => {
  const { devices, maintenance, addMaintenanceLog, resolveMaintenanceLog } = useLounge();
  const [showModal, setShowModal] = useState(false);
  const [deviceId, setDeviceId] = useState(devices[0]?.id || '');
  const [itemType, setItemType] = useState<MaintenanceItem['itemType']>('controller');
  const [issue, setIssue] = useState('');
  const [cost, setCost] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dev = devices.find((d) => d.id === deviceId);
    if (!dev || !issue) return;

    addMaintenanceLog({
      deviceId,
      deviceName: dev.name,
      itemType,
      issue,
      cost,
      status: 'pending',
    });

    setIssue('');
    setCost(0);
    setShowModal(false);
  };

  const pendingList = maintenance.filter((m) => m.status === 'pending');
  const repairedList = maintenance.filter((m) => m.status === 'repaired');
  const totalCost = maintenance.reduce((sum, m) => sum + m.cost, 0);

  return (
    <div className="space-y-6 text-[#DEDEDE]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#4D4D4D]/60">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-baseline">
              Clash<span className="text-[#F25623]">.</span>
            </h1>
            <span className="text-xs font-bold text-[#8C8C8C] uppercase tracking-wider">Maintenance</span>
          </div>
          <p className="text-xs text-[#8C8C8C] mt-1">
            Log issues and track repair costs for controllers, consoles, and displays
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#F25623]/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Log Maintenance Issue</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#1E1E1E] border border-[#4D4D4D] shadow-xl">
          <div className="text-xs font-bold text-amber-400 mb-1">In Maintenance</div>
          <div className="text-2xl font-black text-white">{pendingList.length} items</div>
          <p className="text-[11px] text-[#8C8C8C] mt-1">Under inspection or repair</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#1E1E1E] border border-[#4D4D4D] shadow-xl">
          <div className="text-xs font-bold text-emerald-400 mb-1">Repaired</div>
          <div className="text-2xl font-black text-white">{repairedList.length} items</div>
          <p className="text-[11px] text-[#8C8C8C] mt-1">Ready for use</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#1E1E1E] border border-[#4D4D4D] shadow-xl">
          <div className="text-xs font-bold text-[#F25623] mb-1">Total Maintenance Cost</div>
          <div className="text-2xl font-black text-white">{formatCurrency(totalCost)}</div>
          <p className="text-[11px] text-[#8C8C8C] mt-1">Spare parts &amp; labor</p>
        </div>
      </div>

      {/* Pending Maintenance List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white">Active Maintenance Issues:</h3>

        {pendingList.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#1E1E1E] border border-dashed border-[#4D4D4D] text-center text-xs text-[#8C8C8C]">
            No maintenance issues currently recorded
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingList.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-[#1E1E1E] border border-[#4D4D4D] shadow-xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">{item.deviceName}</h4>
                    <span className="text-xs text-[#F25623] font-semibold mt-0.5 inline-block">
                      {item.itemType === 'controller' ? 'Controller' : item.itemType === 'console' ? 'Console' : 'Display & Cables'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white bg-[#242424] px-3 py-1 rounded-full border border-[#4D4D4D]">
                    {formatCurrency(item.cost)}
                  </span>
                </div>

                <p className="text-xs text-[#DEDEDE] bg-[#242424] p-3 rounded-2xl border border-[#4D4D4D]/60">
                  {item.issue}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-[#8C8C8C]">{item.createdAt}</span>
                  <button
                    onClick={() => resolveMaintenanceLog(item.id)}
                    className="px-4 py-2 rounded-full border border-[#4D4D4D] bg-[#242424] hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-[#DEDEDE] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Repaired</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl p-6 space-y-4 text-[#DEDEDE]">
            <div className="flex items-center justify-between pb-3 border-b border-[#4D4D4D]/60">
              <h3 className="text-base font-bold text-white">Log Maintenance Issue</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#8C8C8C] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Device / Console:</label>
                <select
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs focus:outline-none focus:border-[#F25623]"
                >
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Component:</label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value as MaintenanceItem['itemType'])}
                    className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs focus:outline-none focus:border-[#F25623]"
                  >
                    <option value="controller">Controller</option>
                    <option value="console">Console</option>
                    <option value="screen">Display Screen</option>
                    <option value="hdmi">Cable &amp; Connectors</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Cost (EGP):</label>
                  <input
                    type="number"
                    min="0"
                    value={cost || ''}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-sm font-bold focus:outline-none focus:border-[#F25623]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Issue Description:</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the issue..."
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs placeholder-[#8C8C8C] focus:outline-none focus:border-[#F25623]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-full border border-[#4D4D4D] bg-[#242424] text-[#8C8C8C] hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-bold shadow-md shadow-[#F25623]/25"
                >
                  Save Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
