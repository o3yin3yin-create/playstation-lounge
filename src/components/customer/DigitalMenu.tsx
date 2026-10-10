'use client';

import React, { useState } from 'react';
import { useLounge } from '../../context/LoungeContext';
import { formatCurrency } from '../../lib/calculations';

export const DigitalMenu: React.FC = () => {
  const { menuItems } = useLounge();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'hot', label: 'Hot' },
    { id: 'cold', label: 'Cold' },
    { id: 'fresh', label: 'Juices' },
    { id: 'energy', label: 'Energy' },
    { id: 'snack', label: 'Snacks' },
  ];

  const filteredItems = menuItems.filter((i) => {
    if (activeCategory === 'all') return true;
    return i.category === activeCategory;
  });

  return (
    <div className="space-y-6 text-[#DEDEDE]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#4D4D4D]/60">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-baseline">
              Clash<span className="text-[#F25623]">.</span>
            </h1>
            <span className="text-xs font-bold text-[#8C8C8C] uppercase tracking-wider">Cafe Menu</span>
          </div>
          <p className="text-xs text-[#8C8C8C] mt-1">
            Hot and cold beverages, fresh juices, and snacks
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap shrink-0 transition-all ${
              activeCategory === c.id
                ? 'bg-[#F25623] text-white shadow-sm shadow-[#F25623]/30'
                : 'bg-[#1E1E1E] border border-[#4D4D4D] text-[#8C8C8C] hover:text-white hover:bg-[#252525]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Menu Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-3xl bg-[#1E1E1E] border border-[#4D4D4D] shadow-xl flex items-center justify-between gap-4 hover:border-[#8C8C8C] transition-all"
          >
            <div>
              <h3 className="font-bold text-sm text-white">{item.name}</h3>
              <p className="text-xs text-[#8C8C8C] mt-0.5">
                {item.category === 'hot'
                  ? 'Hot'
                  : item.category === 'cold'
                  ? 'Cold'
                  : item.category === 'fresh'
                  ? 'Juice'
                  : item.category === 'energy'
                  ? 'Energy'
                  : 'Snack'}
              </p>
            </div>

            <div className="text-base font-black text-[#F25623]">
              {formatCurrency(item.price)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
