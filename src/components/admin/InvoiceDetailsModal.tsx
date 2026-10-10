'use client';

import React from 'react';
import { 
  X, 
  Printer, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  Gamepad2, 
  Coffee, 
  User, 
  Phone,
  Banknote,
  CreditCard,
  Smartphone
} from 'lucide-react';
import { GameSession } from '../../types';
import { formatCurrency, formatMinutes } from '../../lib/calculations';

interface InvoiceDetailsModalProps {
  session: GameSession;
  onClose: () => void;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ session, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = session.endTime 
    ? new Date(session.endTime).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : new Date(session.startTime).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  const formattedTime = session.endTime 
    ? new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const invoiceNumber = session.id.replace('sess-', '').replace('takeaway-', '').slice(-6).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md max-h-[90vh] flex flex-col bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl overflow-hidden text-[#DEDEDE]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#4D4D4D]/70 bg-[#242424]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#F25623]/15 border border-[#F25623]/30 text-[#F25623]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Invoice #{invoiceNumber}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Paid
                </span>
              </div>
              <p className="text-xs text-[#8C8C8C] mt-0.5">
                {formattedDate} • {formattedTime}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-[#DEDEDE] hover:text-white p-1.5 rounded-xl hover:bg-[#2A2A2A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Printable Thermal Receipt Card */}
          <div
            id="thermal-receipt"
            className="p-5 rounded-2xl border border-[#4D4D4D] bg-white text-zinc-900 font-mono text-xs space-y-3 shadow-md"
          >
            {/* Store Brand */}
            <div className="text-center border-b border-dashed border-zinc-300 pb-3">
              <h3 className="font-bold text-lg text-black tracking-widest">CLASH</h3>
              <p className="text-[11px] text-zinc-600">PlayStation Lounge & Cafe</p>
              <div className="text-[10px] text-zinc-500 mt-1">
                Receipt #{invoiceNumber} • {formattedDate} {formattedTime}
              </div>
            </div>

            {/* Customer & Console Info */}
            <div className="space-y-1.5 border-b border-dashed border-zinc-300 pb-3 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-600">Console / Device:</span>
                <span className="font-bold text-black">{session.deviceName}</span>
              </div>
              {session.customerName && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Customer:</span>
                  <span className="font-medium text-black">{session.customerName}</span>
                </div>
              )}
              {session.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Phone:</span>
                  <span className="font-mono text-zinc-700">{session.customerPhone}</span>
                </div>
              )}
              {session.totalTimeMinutes !== undefined && session.totalTimeMinutes > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Play Mode:</span>
                    <span className="font-medium">{session.mode === 'multi' ? 'Multiplayer' : 'Single Player'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Duration Played:</span>
                    <span className="font-bold">{formatMinutes(session.totalTimeMinutes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Hourly Rate:</span>
                    <span className="text-zinc-700">{session.hourlyRate} EGP/h</span>
                  </div>
                  <div className="flex justify-between pt-1 font-bold text-black">
                    <span>Gaming Charge:</span>
                    <span>{formatCurrency(session.totalTimeCost || 0)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Cafe Items Breakdown */}
            {session.orders && session.orders.length > 0 && (
              <div className="border-b border-dashed border-zinc-300 pb-3 space-y-1.5 text-xs">
                <div className="font-bold text-zinc-800 mb-1">Cafe Orders:</div>
                {session.orders.map((ord, idx) => (
                  <div key={idx} className="flex justify-between items-center text-zinc-800">
                    <div>
                      <span className="font-medium">{ord.name}</span>
                      <span className="text-zinc-500 text-[11px] ml-1.5">(x{ord.quantity} @ {ord.price})</span>
                    </div>
                    <span className="font-semibold text-black">{formatCurrency(ord.price * ord.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-black pt-1">
                  <span>Cafe Total:</span>
                  <span>{formatCurrency(session.totalOrdersCost || 0)}</span>
                </div>
              </div>
            )}

            {/* Calculations & Totals */}
            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span>{formatCurrency((session.totalTimeCost || 0) + (session.totalOrdersCost || 0))}</span>
              </div>
              {session.discount !== undefined && session.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Discount:</span>
                  <span>- {formatCurrency(session.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-black border-t-2 border-dashed border-black pt-2">
                <span>Grand Total:</span>
                <span>{formatCurrency(session.grandTotal || 0)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-600 pt-1">
                <span>Payment Method:</span>
                <span className="font-bold uppercase text-zinc-800">
                  {session.paymentMethod ? session.paymentMethod.replace('_', ' ') : 'Cash'}
                </span>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="text-center text-[10px] text-zinc-500 pt-2 border-t border-dashed border-zinc-300">
              Thank you for visiting Clash!
            </div>
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="flex gap-2.5 px-6 py-4 border-t border-[#4D4D4D]/70 bg-[#242424]/60">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-full border border-[#4D4D4D] bg-[#242424] hover:bg-[#2F2F2F] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-[#F25623]" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-bold shadow-md shadow-[#F25623]/25 transition-all active:scale-95"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
