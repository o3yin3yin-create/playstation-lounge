'use client';

import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, Receipt, Wallet, DollarSign, Check } from 'lucide-react';
import { useLounge } from '../../context/LoungeContext';
import { exportInvoicesToCSV, exportShiftSummaryToCSV, exportExpensesToCSV } from '../../lib/exportUtils';

interface ExportReportsModalProps {
  onClose: () => void;
  stats: {
    totalGrossRevenue: number;
    totalTimeRevenue: number;
    totalCafeRevenue: number;
    totalExpenses: number;
    netProfit: number;
    completedInvoicesCount: number;
  };
}

export const ExportReportsModal: React.FC<ExportReportsModalProps> = ({ onClose, stats }) => {
  const { sessions, expenses, currentShift } = useLounge();
  const [downloadedReport, setDownloadedReport] = useState<string | null>(null);

  const handleExportInvoices = () => {
    exportInvoicesToCSV(sessions);
    setDownloadedReport('invoices');
    setTimeout(() => setDownloadedReport(null), 2000);
  };

  const handleExportShift = () => {
    exportShiftSummaryToCSV(currentShift, stats);
    setDownloadedReport('shift');
    setTimeout(() => setDownloadedReport(null), 2000);
  };

  const handleExportExpenses = () => {
    exportExpensesToCSV(expenses);
    setDownloadedReport('expenses');
    setTimeout(() => setDownloadedReport(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl overflow-hidden text-[#DEDEDE]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#4D4D4D]/70 bg-[#242424]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#F25623]/15 border border-[#F25623]/30 text-[#F25623]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export Financial Reports</h2>
              <p className="text-xs text-[#8C8C8C] mt-0.5">Download Excel & CSV tables</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#DEDEDE] hover:text-white p-1.5 rounded-xl hover:bg-[#2A2A2A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-3">
          
          {/* Option 1: Invoices Export */}
          <div 
            onClick={handleExportInvoices}
            className="p-4 rounded-2xl bg-[#242424] hover:bg-[#2A2A2A] border border-[#4D4D4D]/60 hover:border-[#F25623] cursor-pointer transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#1E1E1E] border border-[#4D4D4D]/40 text-[#F25623] group-hover:scale-105 transition-transform">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white group-hover:text-[#F25623] transition-colors">
                  Closed Invoices ({sessions.filter((s) => s.status === 'completed').length})
                </div>
                <div className="text-[11px] text-[#8C8C8C] mt-0.5">
                  All completed bills, orders breakdown, rates & totals
                </div>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#1E1E1E] text-[#8C8C8C] group-hover:text-white">
              {downloadedReport === 'invoices' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </div>
          </div>

          {/* Option 2: Shift Summary Export */}
          <div 
            onClick={handleExportShift}
            className="p-4 rounded-2xl bg-[#242424] hover:bg-[#2A2A2A] border border-[#4D4D4D]/60 hover:border-[#F25623] cursor-pointer transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#1E1E1E] border border-[#4D4D4D]/40 text-emerald-400 group-hover:scale-105 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                  Current Shift Summary
                </div>
                <div className="text-[11px] text-[#8C8C8C] mt-0.5">
                  Cashier, gross revenues, expenses & drawer cash
                </div>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#1E1E1E] text-[#8C8C8C] group-hover:text-white">
              {downloadedReport === 'shift' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </div>
          </div>

          {/* Option 3: Expenses Export */}
          <div 
            onClick={handleExportExpenses}
            className="p-4 rounded-2xl bg-[#242424] hover:bg-[#2A2A2A] border border-[#4D4D4D]/60 hover:border-[#F25623] cursor-pointer transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#1E1E1E] border border-[#4D4D4D]/40 text-rose-400 group-hover:scale-105 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white group-hover:text-rose-400 transition-colors">
                  Expenses Log ({expenses.length})
                </div>
                <div className="text-[11px] text-[#8C8C8C] mt-0.5">
                  Detailed ledger of recorded expenses and categories
                </div>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#1E1E1E] text-[#8C8C8C] group-hover:text-white">
              {downloadedReport === 'expenses' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#4D4D4D]/70 bg-[#242424]/60">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full border border-[#4D4D4D] bg-[#242424] hover:bg-[#2A2A2A] text-white text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
