'use client';

import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  CheckCircle2,
  FileText,
  Receipt,
  Sliders,
  FileSpreadsheet,
  Palette
} from 'lucide-react';
import { useLounge } from '../../context/LoungeContext';
import { formatCurrency, formatMinutes } from '../../lib/calculations';
import { Expense, GameSession } from '../../types';
import { InvoiceDetailsModal } from './InvoiceDetailsModal';
import { LoungeSettingsModal } from './LoungeSettingsModal';
import { ExportReportsModal } from './ExportReportsModal';
import { ThemeCustomizerModal } from './ThemeCustomizerModal';

export const FinancialDashboard: React.FC = () => {
  const {
    sessions,
    expenses,
    currentShift,
    addExpense,
    closeShift,
    openNewShift,
  } = useLounge();

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<Expense['category']>('supplies');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseNotes, setExpenseNotes] = useState('');

  const [showShiftModal, setShowShiftModal] = useState(false);
  const [actualClosingCash, setActualClosingCash] = useState<number>(0);

  const [showNewShiftModal, setShowNewShiftModal] = useState(false);
  const [newCashierName, setNewCashierName] = useState('');
  const [newStartingCash, setNewStartingCash] = useState<number>(500);

  const [selectedInvoiceSession, setSelectedInvoiceSession] = useState<GameSession | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const completedSessions = sessions.filter((s) => s.status === 'completed');

  const totalTimeRevenue = completedSessions.reduce(
    (acc, s) => acc + (s.totalTimeCost || 0),
    0
  );

  const totalCafeRevenue = completedSessions.reduce(
    (acc, s) => acc + (s.totalOrdersCost || 0),
    0
  );

  const totalDiscounts = completedSessions.reduce(
    (acc, s) => acc + (s.discount || 0),
    0
  );

  const totalGrossRevenue = Math.max(0, totalTimeRevenue + totalCafeRevenue - totalDiscounts);
  const totalExpenses = expenses.reduce((acc, e) => acc + (Math.max(0, e.amount) || 0), 0);
  const netProfit = totalGrossRevenue - totalExpenses;

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeAmount = Math.max(0, Number(expenseAmount) || 0);
    if (!expenseTitle.trim() || safeAmount <= 0) return;

    addExpense({
      title: expenseTitle.trim(),
      category: expenseCategory,
      amount: safeAmount,
      notes: expenseNotes.trim(),
      recordedBy: currentShift.cashierName,
    });

    setExpenseTitle('');
    setExpenseAmount(0);
    setExpenseNotes('');
    setShowExpenseModal(false);
  };

  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeClosing = Math.max(0, Number(actualClosingCash) || 0);
    closeShift(safeClosing);
    setShowShiftModal(false);
  };

  const handleOpenNewShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCashierName.trim()) return;
    const safeStarting = Math.max(0, Number(newStartingCash) || 0);
    openNewShift(safeStarting, newCashierName.trim());
    setShowNewShiftModal(false);
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
            <span className="text-xs font-bold text-[#8C8C8C] uppercase tracking-wider">Finance & Shifts</span>
          </div>
          <p className="text-xs text-[#8C8C8C] mt-1">
            Track lounge revenues, cafe sales, and daily expenses
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2.5 rounded-full border border-[#4D4D4D] bg-[#242424] hover:bg-[#2A2A2A] text-[#DEDEDE] hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
            title="Export Excel & CSV Reports"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#F25623]" />
            <span>Export Reports</span>
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-2.5 rounded-full border border-[#4D4D4D] bg-[#242424] hover:bg-[#2A2A2A] text-[#DEDEDE] hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
            title="Configure Grace Period and Minimum Fee"
          >
            <Sliders className="w-4 h-4 text-[#F25623]" />
            <span>Billing Rules</span>
          </button>

          <button
            onClick={() => setShowThemeModal(true)}
            className="px-4 py-2.5 rounded-full border border-[#4D4D4D] bg-[#242424] hover:bg-[#2A2A2A] text-[#DEDEDE] hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
            title="Customize System Colors & Theme"
          >
            <Palette className="w-4 h-4 text-[#F25623]" />
            <span>Theme &amp; Colors</span>
          </button>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-4 py-2.5 rounded-full border border-[#4D4D4D] bg-[#242424] hover:bg-[#2A2A2A] text-[#DEDEDE] hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#F25623]" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Net Profit */}
        <div className="p-5 rounded-3xl bg-[#1E1E1E] border border-[#4D4D4D] shadow-xl">
          <div className={`text-xs font-bold mb-1 ${netProfit < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {netProfit < 0 ? 'Net Loss' : 'Net Profit'}
          </div>
          <div className={`text-2xl font-black ${netProfit < 0 ? 'text-rose-500' : 'text-white'}`}>
            {formatCurrency(netProfit)}
          </div>
          <p className="text-[11px] text-[#8C8C8C] mt-2">Revenue - Expenses</p>
        </div>

        {/* Total Revenues */}
        <div className="p-5 rounded-3xl bg-[#1E1E1E] border border-[#4D4D4D] shadow-xl">
          <div className="text-xs font-bold text-[#F25623] mb-1">Total Revenue</div>
          <div className="text-2xl font-black text-white">{formatCurrency(totalGrossRevenue)}</div>
          <p className="text-[11px] text-[#8C8C8C] mt-2">Gaming: {formatCurrency(totalTimeRevenue)} • Cafe: {formatCurrency(totalCafeRevenue)}</p>
        </div>

        {/* Cafe Sales */}
        <div className="p-5 rounded-3xl bg-[#1E1E1E] border border-[#4D4D4D] shadow-xl">
          <div className="text-xs font-bold text-[#DEDEDE] mb-1">Cafe Sales</div>
          <div className="text-2xl font-black text-white">{formatCurrency(totalCafeRevenue)}</div>
          <p className="text-[11px] text-[#8C8C8C] mt-2">Drinks &amp; Snacks</p>
        </div>

        {/* Expenses */}
        <div className="p-5 rounded-3xl bg-[#1E1E1E] border border-[#4D4D4D] shadow-xl">
          <div className="text-xs font-bold text-rose-400 mb-1">Total Expenses</div>
          <div className="text-2xl font-black text-white">{formatCurrency(totalExpenses)}</div>
          <p className="text-[11px] text-[#8C8C8C] mt-2">Inventory, maintenance &amp; utilities</p>
        </div>
      </div>

      {/* Tables Row: Expenses & Completed Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Expenses Table */}
        <div className="p-6 rounded-3xl bg-[#1E1E1E] border border-[#4D4D4D] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#4D4D4D]/60">
            <h3 className="text-sm font-bold text-white">Expense Log</h3>
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
              {formatCurrency(totalExpenses)}
            </span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {expenses.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#8C8C8C] border border-dashed border-[#4D4D4D] rounded-2xl">
                No expenses recorded today
              </div>
            ) : (
              expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 rounded-2xl bg-[#242424] border border-[#4D4D4D]/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{exp.title}</div>
                    <div className="text-[11px] text-[#8C8C8C] mt-0.5">
                      {exp.notes || 'General expense'}
                    </div>
                  </div>
                  <div className="font-black text-rose-400">
                    -{formatCurrency(exp.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Invoices */}
        <div className="p-6 rounded-3xl bg-[#1E1E1E] border border-[#4D4D4D] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#4D4D4D]/60">
            <h3 className="text-sm font-bold text-white">Recent Closed Invoices</h3>
            <span className="text-xs font-bold text-[#F25623] bg-[#F25623]/10 px-2.5 py-0.5 rounded-full border border-[#F25623]/20">
              {formatCurrency(totalGrossRevenue)}
            </span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {completedSessions.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#8C8C8C] border border-dashed border-[#4D4D4D] rounded-2xl">
                No closed invoices yet
              </div>
            ) : (
              completedSessions.map((sess) => (
                <div
                  key={sess.id}
                  onClick={() => setSelectedInvoiceSession(sess)}
                  className="p-3 rounded-2xl bg-[#242424] hover:bg-[#2A2A2A] border border-[#4D4D4D]/60 hover:border-[#F25623] transition-all cursor-pointer flex items-center justify-between text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#1E1E1E] text-[#8C8C8C] group-hover:text-[#F25623] transition-colors border border-[#4D4D4D]/40">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-[#F25623] transition-colors">
                        {sess.deviceName} • {sess.customerName || 'Customer'}
                      </div>
                      <div className="text-[11px] text-[#8C8C8C] mt-0.5">
                        Gaming: {formatMinutes(sess.totalTimeMinutes || 0)} • Cafe: {formatCurrency(sess.totalOrdersCost || 0)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-400">
                      {formatCurrency(sess.grandTotal || 0)}
                    </div>
                    <div className="text-[10px] text-[#8C8C8C] group-hover:text-[#DEDEDE] mt-0.5 capitalize">
                      {sess.paymentMethod ? sess.paymentMethod.replace('_', ' ') : 'Cash'} • View
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* MODAL: EXPENSE */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl p-6 space-y-4 text-[#DEDEDE]">
            <div className="flex items-center justify-between pb-3 border-b border-[#4D4D4D]/60">
              <h3 className="text-base font-bold text-white">Record New Expense</h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-[#8C8C8C] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Description:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Soda cans wholesale, controller maintenance..."
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs placeholder-[#8C8C8C] focus:outline-none focus:border-[#F25623]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Amount (EGP):</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={expenseAmount || ''}
                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-sm font-bold focus:outline-none focus:border-[#F25623]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Category:</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as Expense['category'])}
                    className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs focus:outline-none focus:border-[#F25623]"
                  >
                    <option value="supplies">Supplies &amp; Goods</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="electricity">Electricity &amp; Utilities</option>
                    <option value="salaries">Salaries</option>
                    <option value="rent">Rent</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-2.5 rounded-full border border-[#4D4D4D] bg-[#242424] text-[#8C8C8C] hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-bold shadow-md shadow-[#F25623]/25"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLOSE SHIFT */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl p-6 space-y-4 text-[#DEDEDE]">
            <div className="flex items-center justify-between pb-3 border-b border-[#4D4D4D]/60">
              <h3 className="text-base font-bold text-white">Close Cashier Shift</h3>
              <button
                onClick={() => setShowShiftModal(false)}
                className="text-[#8C8C8C] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#242424] border border-[#4D4D4D] text-xs space-y-2">
              <div className="flex justify-between text-[#8C8C8C]">
                <span>Starting Cash:</span>
                <span className="font-bold text-white">{formatCurrency(currentShift.startingCash)}</span>
              </div>
              <div className="flex justify-between text-[#8C8C8C]">
                <span>Revenues:</span>
                <span className="font-bold text-emerald-400">+{formatCurrency(totalGrossRevenue)}</span>
              </div>
              <div className="flex justify-between text-[#8C8C8C]">
                <span>Expenses:</span>
                <span className="font-bold text-rose-400">-{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="flex justify-between font-black text-white pt-2 border-t border-[#4D4D4D]">
                <span>Expected in Drawer:</span>
                <span className="text-[#F25623] text-sm">{formatCurrency(currentShift.startingCash + totalGrossRevenue - totalExpenses)}</span>
              </div>
            </div>

            <form onSubmit={handleCloseShiftSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">
                  Actual Cash in Drawer:
                </label>
                <input
                  type="number"
                  required
                  value={actualClosingCash || ''}
                  onChange={(e) => setActualClosingCash(Number(e.target.value))}
                  placeholder="Enter counted cash amount"
                  className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-sm font-bold focus:outline-none focus:border-[#F25623]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowShiftModal(false)}
                  className="flex-1 py-2.5 rounded-full border border-[#4D4D4D] bg-[#242424] text-[#8C8C8C] hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-bold shadow-md shadow-[#F25623]/25"
                >
                  Confirm Close Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: OPEN SHIFT */}
      {showNewShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl p-6 space-y-4 text-[#DEDEDE]">
            <div className="flex items-center justify-between pb-3 border-b border-[#4D4D4D]/60">
              <h3 className="text-base font-bold text-white">Open Cashier Shift</h3>
              <button
                onClick={() => setShowNewShiftModal(false)}
                className="text-[#8C8C8C] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOpenNewShiftSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Cashier Name:</label>
                <input
                  type="text"
                  required
                  placeholder="Cashier name"
                  value={newCashierName}
                  onChange={(e) => setNewCashierName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs placeholder-[#8C8C8C] focus:outline-none focus:border-[#F25623]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Starting Cash in Drawer:</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStartingCash}
                  onChange={(e) => setNewStartingCash(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-sm font-bold focus:outline-none focus:border-[#F25623]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewShiftModal(false)}
                  className="flex-1 py-2.5 rounded-full border border-[#4D4D4D] bg-[#242424] text-[#8C8C8C] hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-bold shadow-md shadow-[#F25623]/25"
                >
                  Open Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FULL INVOICE DETAILS & RE-PRINT */}
      {selectedInvoiceSession && (
        <InvoiceDetailsModal
          session={selectedInvoiceSession}
          onClose={() => setSelectedInvoiceSession(null)}
        />
      )}

      {/* MODAL: LOUNGE BILLING RULES */}
      {showSettingsModal && (
        <LoungeSettingsModal onClose={() => setShowSettingsModal(false)} />
      )}

      {/* MODAL: EXPORT REPORTS */}
      {showExportModal && (
        <ExportReportsModal
          onClose={() => setShowExportModal(false)}
          stats={{
            totalGrossRevenue,
            totalTimeRevenue,
            totalCafeRevenue,
            totalExpenses,
            netProfit,
            completedInvoicesCount: completedSessions.length,
          }}
        />
      )}

      {/* MODAL: THEME & COLOR CUSTOMIZER */}
      {showThemeModal && (
        <ThemeCustomizerModal onClose={() => setShowThemeModal(false)} />
      )}

    </div>
  );
};
