'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Search } from 'lucide-react';
import { GameSession, MenuItem } from '../../types';
import { useLounge } from '../../context/LoungeContext';
import { formatCurrency } from '../../lib/calculations';

interface AddOrderModalProps {
  session: GameSession;
  onClose: () => void;
}

export const AddOrderModal: React.FC<AddOrderModalProps> = ({ session, onClose }) => {
  const { menuItems, addOrderToSession, removeOrderFromSession } = useLounge();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const handleAddItem = (item: MenuItem) => {
    addOrderToSession(session.id, item.id, 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-lg max-h-[85vh] flex flex-col bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl overflow-hidden text-[#DEDEDE]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#4D4D4D]/70 bg-[#242424]/60">
          <div>
            <h2 className="text-base font-bold text-white">Add Cafe Orders</h2>
            <p className="text-xs text-[#8C8C8C] mt-0.5">{session.deviceName} • {session.customerName || 'Customer'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#DEDEDE] hover:text-white p-1.5 rounded-xl hover:bg-[#2A2A2A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Orders Summary on this session */}
        {session.orders.length > 0 && (
          <div className="px-6 py-3 bg-[#242424] border-b border-[#4D4D4D]/60">
            <div className="text-xs text-[#8C8C8C] mb-2 font-medium">Current Session Orders:</div>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {session.orders.map((ord) => (
                <div
                  key={ord.id}
                  className="flex items-center gap-2 bg-[#2E2E2E] border border-[#4D4D4D]/70 px-3 py-1 rounded-full text-xs"
                >
                  <span className="text-white font-medium">{ord.name}</span>
                  <span className="text-[#8C8C8C]">x{ord.quantity}</span>
                  <span className="text-[#F25623] font-semibold">({formatCurrency(ord.price * ord.quantity)})</span>
                  <button
                    onClick={() => removeOrderFromSession(session.id, ord.id)}
                    className="text-[#8C8C8C] hover:text-rose-400 ml-1 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
                className={`px-3 py-1 rounded-full font-medium whitespace-nowrap shrink-0 transition-colors ${
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

        {/* Items List */}
        <div className="px-6 py-3 overflow-y-auto flex-1 divide-y divide-[#4D4D4D]/40">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="py-3 flex items-center justify-between gap-4"
            >
              <div>
                <div className="text-xs font-semibold text-white">{item.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-[#F25623]">{formatCurrency(item.price)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAddItem(item)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors bg-[#242424] hover:bg-[#F25623] hover:text-white text-[#DEDEDE] border border-[#4D4D4D] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#4D4D4D]/70 flex items-center justify-end bg-[#242424]/40">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-[#F25623]/25 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
