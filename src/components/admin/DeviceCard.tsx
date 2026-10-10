'use client';

import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Play,
  Plus,
  ArrowLeftRight,
  Receipt,
  Settings,
  Clock,
  Coffee,
  User,
  AlertCircle
} from 'lucide-react';
import { Device, GameSession } from '../../types';
import { calculateSessionLiveStats, formatTimer, formatCurrency, playSound } from '../../lib/calculations';

interface DeviceCardProps {
  device: Device;
  session?: GameSession;
  onStartSession: (device: Device) => void;
  onAddOrder: (session: GameSession) => void;
  onTransferSession: (session: GameSession) => void;
  onCheckout: (session: GameSession) => void;
  onEditDevice: (device: Device) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  session,
  onStartSession,
  onAddOrder,
  onTransferSession,
  onCheckout,
  onEditDevice,
}) => {
  const [stats, setStats] = useState(() =>
    session ? calculateSessionLiveStats(session) : null
  );

  useEffect(() => {
    if (!session || session.status !== 'active') {
      setStats(null);
      return;
    }

    const updateStats = () => {
      const live = calculateSessionLiveStats(session);
      setStats(live);
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const isBusy = device.status === 'busy' && !!session;
  const isMaintenance = device.status === 'maintenance';
  const isAvailable = !isBusy && !isMaintenance;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-sm">
      <div className="space-y-5">
        
        {/* Top Header: Device Name, Type, and Options */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-slate-900">{device.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                {device.type === 'VIP_ROOM' ? 'VIP' : device.type}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {device.notes || 'Ultra HD Screen'}
            </p>
          </div>

          <button
            onClick={() => onEditDevice(device)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            title="Device Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Status Pill */}
        <div className="flex items-center justify-between pt-1">
          {isAvailable && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Available
            </span>
          )}

          {isBusy && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              stats?.isOvertime 
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${stats?.isOvertime ? 'bg-rose-500' : 'bg-blue-500'}`}></span>
              {stats?.isOvertime ? 'Time Expired' : 'In Session'}
            </span>
          )}

          {isMaintenance && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              In Maintenance
            </span>
          )}

          <div className="text-xs text-slate-500">
            Rate: <span className="font-semibold text-slate-800">{device.hourlyRateSingle === device.hourlyRateMulti ? `${device.hourlyRateSingle} EGP/h` : `${device.hourlyRateSingle} / ${device.hourlyRateMulti} EGP/h`}</span>
          </div>
        </div>

        {/* ACTIVE SESSION BODY */}
        {isBusy && session && stats && (
          <div className="bg-slate-50 rounded-xl p-4 space-y-4 border border-slate-100">
            {/* Customer Name & Mode */}
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{session.customerName || 'Cash Customer'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-medium">
                  {session.mode === 'multi' ? 'Multi' : 'Single'}
                </span>
                <span className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-medium">
                  {session.sessionType === 'fixed' ? `${session.plannedMinutes} min` : 'Open Time'}
                </span>
              </div>
            </div>

            {/* Timer Displays with generous line height and spacing */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Elapsed Time</span>
                <span className="font-mono text-xl font-bold text-slate-900" dir="ltr">
                  {formatTimer(stats.elapsedSeconds)}
                </span>
              </div>

              <div>
                {session.sessionType === 'fixed' ? (
                  <>
                    <span className="text-[11px] text-slate-500 block mb-1">Remaining Time</span>
                    <span className={`font-mono text-xl font-bold ${stats.isOvertime ? 'text-rose-600' : 'text-slate-900'}`} dir="ltr">
                      {stats.isOvertime ? `+${formatTimer(stats.elapsedSeconds - (session.plannedMinutes || 0) * 60)}` : formatTimer(stats.remainingSeconds)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] text-slate-500 block mb-1">Current Session Cost</span>
                    <span className="text-lg font-bold text-slate-900">
                      {formatCurrency(stats.timeCost)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Orders & Total Line */}
            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-200">
              <div className="flex items-center gap-1 text-slate-600">
                <Coffee className="w-3.5 h-3.5 text-slate-400" />
                <span>Cafe:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(stats.ordersCost)}</span>
              </div>

              <div>
                <span className="text-slate-500">Total: </span>
                <span className="font-bold text-slate-900 text-sm">{formatCurrency(stats.grandTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Available State Note */}
        {isAvailable && (
          <div className="py-6 text-center text-xs text-slate-500">
            Console is available for a new session
          </div>
        )}
      </div>

      {/* Action Footer Buttons */}
      <div className="pt-5 mt-2 border-t border-slate-100">
        {isAvailable && (
          <button
            onClick={() => onStartSession(device)}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Session</span>
          </button>
        )}

        {isBusy && session && (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onAddOrder(session)}
              className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-slate-600" />
              <span>Add Order</span>
            </button>

            <button
              onClick={() => onTransferSession(session)}
              className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-600" />
              <span>Transfer</span>
            </button>

            <button
              onClick={() => onCheckout(session)}
              className="py-2 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Checkout</span>
            </button>
          </div>
        )}

        {isMaintenance && (
          <div className="text-center py-2 text-xs text-amber-700 font-medium">
            Device currently unavailable
          </div>
        )}
      </div>
    </div>
  );
};
