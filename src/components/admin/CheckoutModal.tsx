'use client';

import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Receipt, 
  Check,
  Banknote,
  Smartphone,
  CreditCard
} from 'lucide-react';
import { GameSession } from '../../types';
import { useLounge } from '../../context/LoungeContext';
import { calculateSessionLiveStats, formatCurrency, formatMinutes } from '../../lib/calculations';

interface CheckoutModalProps {
  session: GameSession;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ session, onClose }) => {
  const { endSession, settings } = useLounge();
  const [discount, setDiscount] = useState<number>(session.discount || 0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'vodafone_cash'>('cash');
  const [isCompleted, setIsCompleted] = useState(false);

  const stats = calculateSessionLiveStats({ ...session, discount }, undefined, settings);

  const handleCheckout = () => {
    const res = endSession({
      sessionId: session.id,
      discount,
      paymentMethod,
    });
    if (res) {
      setIsCompleted(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-md max-h-[85vh] flex flex-col bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl overflow-hidden text-[#DEDEDE]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#4D4D4D]/70 bg-[#242424]/60">
          <div>
            <h2 className="text-base font-bold text-white">
              {isCompleted ? 'Session Completed' : 'Session Checkout'}
            </h2>
            <p className="text-xs text-[#8C8C8C] mt-0.5">
              {session.deviceName} • {session.customerName || 'Customer'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#DEDEDE] hover:text-white p-1.5 rounded-xl hover:bg-[#2A2A2A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Minimal Thermal Receipt */}
          <div
            id="thermal-receipt"
            className="p-5 rounded-2xl border border-[#4D4D4D] bg-white text-zinc-900 font-mono text-xs space-y-3 shadow-sm"
          >
            <div className="text-center border-b border-dashed border-zinc-300 pb-3">
              <h3 className="font-bold text-base text-black tracking-wider">CLASH</h3>
              <p className="text-[11px] text-zinc-600">PlayStation Lounge & Cafe</p>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="space-y-1.5 border-b border-dashed border-zinc-300 pb-3 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-600">Console:</span>
                <span className="font-bold text-black">{session.deviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Mode:</span>
                <span className="font-medium">{session.mode === 'multi' ? 'Multiplayer' : 'Single'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Duration:</span>
                <span className="font-bold">{formatMinutes(stats.exactMinutes)}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-black items-center">
                <span>Gaming Charge:</span>
                <span className="flex items-center gap-1.5">
                  {stats.appliedRule === 'grace_period' && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      Grace Period (Free)
                    </span>
                  )}
                  {stats.appliedRule === 'minimum_charge' && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700">
                      Min Fee Applied
                    </span>
                  )}
                  <span>{formatCurrency(stats.timeCost)}</span>
                </span>
              </div>
            </div>

            {session.orders.length > 0 && (
              <div className="border-b border-dashed border-zinc-300 pb-3 space-y-1 text-xs">
                <div className="font-semibold text-zinc-700 mb-1">Cafe Orders:</div>
                {session.orders.map((ord, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-zinc-800">
                      {ord.name} (x{ord.quantity})
                    </span>
                    <span className="font-medium">{formatCurrency(ord.price * ord.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-black pt-1">
                  <span>Cafe Total:</span>
                  <span>{formatCurrency(stats.ordersCost)}</span>
                </div>
              </div>
            )}

            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(stats.timeCost + stats.ordersCost)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Discount:</span>
                  <span>- {formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-black border-t-2 border-dashed border-black pt-2">
                <span>Grand Total:</span>
                <span>{formatCurrency(stats.grandTotal)}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-zinc-500 pt-2 border-t border-dashed border-zinc-300">
              Thank you for playing at Clash!
            </div>
          </div>

          {/* Checkout Controls */}
          {!isCompleted && (
            <div className="space-y-4">
              {/* Discount Input */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#242424] border border-[#4D4D4D]">
                <div>
                  <span className="text-xs font-medium text-[#DEDEDE] block">Discount (EGP):</span>
                  <span className="text-[10px] text-[#8C8C8C]">Max: {formatCurrency(stats.timeCost + stats.ordersCost)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={stats.timeCost + stats.ordersCost}
                    value={discount}
                    onChange={(e) => {
                      const subtotal = stats.timeCost + stats.ordersCost;
                      const val = Math.max(0, Number(e.target.value) || 0);
                      setDiscount(Math.min(subtotal, val));
                    }}
                    className="w-20 px-2.5 py-1 rounded-xl bg-[#1E1E1E] border border-[#4D4D4D] text-center text-xs font-bold text-white focus:outline-none focus:border-[#F25623]"
                  />
                  <span className="text-xs text-[#8C8C8C]">EGP</span>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-[#8C8C8C] mb-2">Payment Method:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 rounded-xl border text-xs font-medium transition-colors ${
                      paymentMethod === 'cash'
                        ? 'border-[#F25623] bg-[#F25623] text-white font-bold shadow-sm shadow-[#F25623]/25'
                        : 'border-[#4D4D4D] bg-[#242424] text-[#8C8C8C] hover:text-white'
                    }`}
                  >
                    Cash
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('vodafone_cash')}
                    className={`py-2 rounded-xl border text-xs font-medium transition-colors ${
                      paymentMethod === 'vodafone_cash'
                        ? 'border-[#F25623] bg-[#F25623] text-white font-bold shadow-sm shadow-[#F25623]/25'
                        : 'border-[#4D4D4D] bg-[#242424] text-[#8C8C8C] hover:text-white'
                    }`}
                  >
                    Vodafone Cash
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 rounded-xl border text-xs font-medium transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-[#F25623] bg-[#F25623] text-white font-bold shadow-sm shadow-[#F25623]/25'
                        : 'border-[#4D4D4D] bg-[#242424] text-[#8C8C8C] hover:text-white'
                    }`}
                  >
                    Card
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#4D4D4D]/70 flex items-center justify-between gap-3 bg-[#242424]/60">
          <button
            onClick={handlePrint}
            className="py-2.5 px-4 rounded-full border border-[#4D4D4D] bg-[#242424] hover:bg-[#2E2E2E] text-[#DEDEDE] text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          {!isCompleted ? (
            <button
              onClick={handleCheckout}
              className="py-2.5 px-6 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#F25623]/25 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Complete & Pay ({formatCurrency(stats.grandTotal)})</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
