'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, Check, Search, Coffee, CheckCircle2 } from 'lucide-react';
import { GameSession, MenuItem } from '../../types';
import { useLounge } from '../../context/LoungeContext';
import { formatCurrency } from '../../lib/calculations';

interface AddOrderModalProps {
  session: GameSession;
  onClose: () => void;
}

export const AddOrderModal: React.FC<AddOrderModalProps> = ({ session, onClose }) => {
  const { menuItems, sessions, addOrderToSession, removeOrderFromSession } = useLounge();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Always use the live session from context so orders update instantaneously
  const liveSession = sessions.find((s) => s.id === session.id) || session;

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'hot', label: 'Hot' },
    { id: 'cold', label: 'Cold' },
    { id: 'fresh', label: 'Juices' },
    { id: 'energy', label: 'Energy' },
    { id: 'snack', label: 'Snacks' },
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getItemQuantity = (itemId: string) => {
    return liveSession.orders
      .filter((o) => o.menuItemId === itemId)
      .reduce((sum, o) => sum + o.quantity, 0);
  };

  const getOrderItemId = (itemId: string) => {
    const order = liveSession.orders.find((o) => o.menuItemId === itemId);
    return order ? order.id : null;
  };

  const handleAddItem = (item: MenuItem) => {
    addOrderToSession(liveSession.id, item.id, 1);
    setJustAddedId(item.id);
    setTimeout(() => {
      setJustAddedId((curr) => (curr === item.id ? null : curr));
    }, 1200);
  };

  const handleDecrementItem = (itemId: string) => {
    const orderId = getOrderItemId(itemId);
    if (orderId) {
      removeOrderFromSession(liveSession.id, orderId);
    }
  };

  const totalOrdersCost = liveSession.orders.reduce(
    (sum, o) => sum + (o.price || 0) * (o.quantity || 1),
    0
  );
  const totalOrdersCount = liveSession.orders.reduce(
    (sum, o) => sum + (o.quantity || 1),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl overflow-hidden text-[#DEDEDE]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#4D4D4D]/70 bg-[#242424]/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Add Cafe Orders</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F25623]/20 border border-[#F25623]/30 text-[#F25623]">
                {liveSession.deviceName}
              </span>
            </div>
            <p className="text-xs text-[#8C8C8C] mt-0.5">
              {liveSession.customerName || 'Customer'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#DEDEDE] hover:text-white p-2 rounded-xl hover:bg-[#2A2A2A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Orders Tray: Real-Time Instant Feedback */}
        {liveSession.orders.length > 0 && (
          <div className="px-6 py-3 bg-[#242424] border-b border-[#4D4D4D]/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#8C8C8C]">Orders in this Session:</span>
              <span className="text-[#F25623] font-bold">
                {totalOrdersCount} items • {formatCurrency(totalOrdersCost)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
              {liveSession.orders.map((ord) => (
                <div
                  key={ord.id}
                  className="flex items-center gap-2 bg-[#1E1E1E] border border-[#4D4D4D] px-3 py-1 rounded-full text-xs animate-in zoom-in-95 duration-150 shadow-sm"
                >
                  <span className="text-white font-medium">{ord.name}</span>
                  <span className="text-[#F25623] font-bold">x{ord.quantity}</span>
                  <span className="text-[#8C8C8C] text-[11px]">({formatCurrency(ord.price * ord.quantity)})</span>
                  <button
                    onClick={() => removeOrderFromSession(liveSession.id, ord.id)}
                    className="text-[#8C8C8C] hover:text-rose-400 p-0.5 rounded-full hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                    title="Remove 1 item"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Category Filter */}
        <div className="p-6 pb-2 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C8C8C] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-[#242424] border border-[#4D4D4D] text-white text-xs placeholder:text-[#8C8C8C] focus:outline-none focus:border-[#F25623]"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto text-xs pb-1">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1 rounded-full font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-[#F25623] text-white shadow-sm shadow-[#F25623]/30 font-semibold'
                    : 'bg-[#242424] text-[#8C8C8C] hover:text-white border border-[#4D4D4D]/60'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Items List with Live Stepper & Feedback */}
        <div className="px-6 py-3 overflow-y-auto flex-1 divide-y divide-[#4D4D4D]/40">
          {filteredItems.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#8C8C8C] space-y-1">
              <Coffee className="w-8 h-8 mx-auto opacity-40 mb-2" />
              <p>No menu items available.</p>
              <p className="text-[11px] text-[#8C8C8C]/70">Add drinks in Cafe & POS to display them here.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const qty = getItemQuantity(item.id);
              const isJustAdded = justAddedId === item.id;

              return (
                <div
                  key={item.id}
                  className={`py-3.5 flex items-center justify-between gap-4 transition-all duration-200 ${
                    isJustAdded ? 'bg-[#F25623]/10 px-3 rounded-2xl border border-[#F25623]/30' : ''
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {isJustAdded && (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 animate-in fade-in">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Added!</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-[#F25623]">{formatCurrency(item.price)}</span>
                      <span className="text-[10px] text-[#8C8C8C] uppercase font-semibold">
                        {item.category === 'hot'
                          ? 'Hot'
                          : item.category === 'cold'
                          ? 'Cold'
                          : item.category === 'fresh'
                          ? 'Juice'
                          : item.category === 'energy'
                          ? 'Energy'
                          : 'Snack'}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper or Add Button */}
                  {qty > 0 ? (
                    <div className="flex items-center gap-1.5 bg-[#242424] border border-[#4D4D4D] p-1 rounded-2xl shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleDecrementItem(item.id)}
                        className="w-7 h-7 rounded-xl bg-[#1E1E1E] hover:bg-[#2A2A2A] border border-[#4D4D4D]/60 flex items-center justify-center text-[#DEDEDE] hover:text-rose-400 transition-colors cursor-pointer"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-7 text-center font-black text-xs text-white">
                        {qty}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAddItem(item)}
                        className="w-7 h-7 rounded-xl bg-[#F25623] hover:bg-[#E04816] flex items-center justify-center text-white shadow-sm transition-transform active:scale-95 cursor-pointer"
                        title="Add 1 more"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddItem(item)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-[#242424] hover:bg-[#F25623] hover:text-white text-[#DEDEDE] border border-[#4D4D4D]'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#4D4D4D]/70 flex items-center justify-between bg-[#242424]/80">
          <div>
            <div className="text-[11px] text-[#8C8C8C]">Total Orders:</div>
            <div className="text-sm font-bold text-white">
              {totalOrdersCount > 0 ? (
                <span className="text-[#F25623]">{formatCurrency(totalOrdersCost)}</span>
              ) : (
                <span className="text-[#8C8C8C]">0 EGP</span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#F25623]/25 transition-transform active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
