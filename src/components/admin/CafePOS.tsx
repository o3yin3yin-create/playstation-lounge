'use client';

import React, { useState } from 'react';
import {
  Coffee,
  Plus,
  Minus,
  Search,
  Check
} from 'lucide-react';
import { useLounge } from '../../context/LoungeContext';
import { formatCurrency } from '../../lib/calculations';
import { MenuItem } from '../../types';

export const CafePOS: React.FC = () => {
  const { menuItems, quickCafeSale, updateMenuItemStock, addMenuItem } = useLounge();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [cart, setCart] = useState<{ menuItemId: string; quantity: number }[]>([]);
  const [customerName, setCustomerName] = useState('');

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<MenuItem['category']>('hot');
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  const [newItemCost, setNewItemCost] = useState<number>(0);
  const [newItemStock, setNewItemStock] = useState<number>(50);

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

  const addToCart = (itemId: string) => {
    const targetItem = menuItems.find((m) => m.id === itemId);
    if (!targetItem || targetItem.stock <= 0) return;

    setCart((prev) => {
      const exists = prev.find((c) => c.menuItemId === itemId);
      if (exists) {
        if (exists.quantity >= targetItem.stock) return prev;
        return prev.map((c) => (c.menuItemId === itemId ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { menuItemId: itemId, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) =>
      prev
        .map((c) => (c.menuItemId === itemId ? { ...c, quantity: c.quantity - 1 } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, c) => {
    const item = menuItems.find((m) => m.id === c.menuItemId);
    return sum + (item ? item.price * c.quantity : 0);
  }, 0);

  const handleCheckoutTakeaway = () => {
    if (cart.length === 0) return;
    quickCafeSale(cart, customerName || 'Takeaway Customer');
    setCart([]);
    setCustomerName('');
  };

  const handleAddNewItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || newItemPrice <= 0) return;

    addMenuItem({
      name: newItemName,
      category: newItemCategory,
      price: newItemPrice,
      cost: newItemCost,
      stock: newItemStock,
      available: true,
    });

    setNewItemName('');
    setNewItemPrice(0);
    setNewItemCost(0);
    setNewItemStock(50);
    setShowAddItemModal(false);
  };

  return (
    <div className="space-y-6 text-[#DEDEDE]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#4D4D4D]/60">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-baseline">
              Clash<span className="text-[#F25623]">.</span>
            </h1>
            <span className="text-xs font-bold text-[#8C8C8C] uppercase tracking-wider">Cafe & POS</span>
          </div>
          <p className="text-xs text-[#8C8C8C] mt-1">
            Fast takeaway sales, cafe inventory and pricing management
          </p>
        </div>

        <button
          onClick={() => setShowAddItemModal(true)}
          className="px-4 py-2.5 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#F25623]/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Menu & Inventory Items */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Search & Categories */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8C8C8C] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-3 pl-10 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#4D4D4D] text-white text-xs placeholder-[#8C8C8C] focus:outline-none focus:border-[#F25623] transition-colors"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto text-xs pb-1">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap shrink-0 transition-all ${
                    selectedCategory === c.id
                      ? 'bg-[#F25623] text-white shadow-sm shadow-[#F25623]/30'
                      : 'bg-[#1E1E1E] border border-[#4D4D4D] text-[#8C8C8C] hover:text-white hover:bg-[#252525]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredItems.map((item) => {
              const inCart = cart.find((c) => c.menuItemId === item.id);
              const isOut = item.stock <= 0;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#1E1E1E] border border-[#4D4D4D] shadow-lg flex flex-col justify-between hover:border-[#8C8C8C] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white">{item.name}</h3>
                      <div className="text-xs text-[#F25623] mt-1 font-black">
                        {formatCurrency(item.price)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#8C8C8C] bg-[#242424] px-2.5 py-1 rounded-xl border border-[#4D4D4D]/60">
                      <span>Stock:</span>
                      <span className={`font-bold ${isOut ? 'text-rose-500' : 'text-white'}`}>{item.stock}</span>
                      <button
                        onClick={() => updateMenuItemStock(item.id, item.stock + 5)}
                        className="text-[#F25623] hover:text-[#FFA07A] font-bold ml-1"
                        title="Add 5 to stock"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#4D4D4D]/50 flex items-center justify-end">
                    {inCart ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] border border-[#4D4D4D] flex items-center justify-center text-[#DEDEDE]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-xs text-white px-1">{inCart.quantity}</span>
                        <button
                          disabled={inCart.quantity >= item.stock}
                          onClick={() => addToCart(item.id)}
                          className="w-7 h-7 rounded-lg bg-[#F25623] hover:bg-[#E04816] flex items-center justify-center text-white disabled:opacity-30 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={isOut}
                        onClick={() => addToCart(item.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          isOut
                            ? 'bg-[#242424] text-[#8C8C8C] cursor-not-allowed border border-[#4D4D4D]/40'
                            : 'bg-[#242424] hover:bg-[#F25623] hover:text-white text-[#DEDEDE] border border-[#4D4D4D]'
                        }`}
                      >
                        Add to Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Takeaway Cart Panel */}
        <div className="bg-[#1E1E1E] p-6 rounded-3xl border border-[#4D4D4D] shadow-2xl h-fit space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#4D4D4D]/60">
            <h2 className="font-bold text-base text-white">Takeaway Order</h2>
            <span className="text-xs text-[#F25623] font-bold bg-[#F25623]/10 px-2.5 py-0.5 rounded-full border border-[#F25623]/20">
              {cart.length} items
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#DEDEDE] mb-1.5">Customer Name (Optional):</label>
            <input
              type="text"
              placeholder="Takeaway Customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs placeholder-[#8C8C8C] focus:outline-none focus:border-[#F25623]"
            />
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#8C8C8C] border border-dashed border-[#4D4D4D] rounded-2xl">
                Click &quot;Add to Order&quot; to start a sale
              </div>
            ) : (
              cart.map((c) => {
                const item = menuItems.find((m) => m.id === c.menuItemId);
                if (!item) return null;
                return (
                  <div
                    key={c.menuItemId}
                    className="p-3 rounded-2xl bg-[#242424] border border-[#4D4D4D]/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="text-[#F25623] font-semibold mt-0.5">{formatCurrency(item.price * c.quantity)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-6 h-6 rounded-lg bg-[#1E1E1E] border border-[#4D4D4D] text-[#8C8C8C] hover:text-white flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-white">{c.quantity}</span>
                      <button
                        disabled={c.quantity >= item.stock}
                        onClick={() => addToCart(item.id)}
                        className="w-6 h-6 rounded-lg bg-[#F25623] hover:bg-[#E04816] text-white flex items-center justify-center disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-[#4D4D4D]/60 space-y-3">
            <div className="flex justify-between items-center text-sm font-black text-white">
              <span>Total:</span>
              <span className="text-[#F25623] text-base">{formatCurrency(cartTotal)}</span>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={handleCheckoutTakeaway}
              className={`w-full py-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                cart.length > 0
                  ? 'bg-[#F25623] hover:bg-[#E04816] text-white shadow-[#F25623]/25 active:scale-98'
                  : 'bg-[#242424] text-[#8C8C8C] cursor-not-allowed border border-[#4D4D4D]/40'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Complete Sale &amp; Pay</span>
            </button>
          </div>
        </div>

      </div>

      {/* MODAL: ADD MENU ITEM */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl p-6 space-y-4 text-[#DEDEDE]">
            <div className="flex items-center justify-between pb-3 border-b border-[#4D4D4D]/60">
              <h3 className="text-base font-bold text-white">Add New Menu Item</h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-[#8C8C8C] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewItemSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Item Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mint Tea, Club Sandwich..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs placeholder-[#8C8C8C] focus:outline-none focus:border-[#F25623]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Category:</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as MenuItem['category'])}
                    className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs focus:outline-none focus:border-[#F25623]"
                  >
                    <option value="hot">Hot</option>
                    <option value="cold">Cold</option>
                    <option value="fresh">Juices</option>
                    <option value="energy">Energy</option>
                    <option value="snack">Snacks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Initial Stock:</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs focus:outline-none focus:border-[#F25623]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Selling Price (EGP):</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItemPrice || ''}
                    onChange={(e) => setNewItemPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-sm font-bold focus:outline-none focus:border-[#F25623]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Cost (EGP):</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemCost || ''}
                    onChange={(e) => setNewItemCost(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-sm focus:outline-none focus:border-[#F25623]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="flex-1 py-2.5 rounded-full border border-[#4D4D4D] bg-[#242424] text-[#8C8C8C] hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-bold shadow-md shadow-[#F25623]/25"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
