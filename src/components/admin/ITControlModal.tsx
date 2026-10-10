'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Server,
  Lock
} from 'lucide-react';
import { useLounge } from '../../context/LoungeContext';

interface ITControlModalProps {
  onClose: () => void;
}

export const ITControlModal: React.FC<ITControlModalProps> = ({ onClose }) => {
  const { 
    authSettings, 
    updateAdminPassword, 
    updateITPassword 
  } = useLounge();

  const [activeTab, setActiveTab] = useState<'admin_pass' | 'it_pass' | 'system'>('admin_pass');

  // Admin password change form
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [adminPassMsg, setAdminPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // IT password change form
  const [newITPass, setNewITPass] = useState('');
  const [confirmITPass, setConfirmITPass] = useState('');
  const [itPassMsg, setITPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Toggle show password
  const [showAdminCurrent, setShowAdminCurrent] = useState(false);
  const [showITCurrent, setShowITCurrent] = useState(false);

  const handleUpdateAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPassMsg(null);

    if (newAdminPass.length < 3) {
      setAdminPassMsg({ type: 'error', text: 'Password must be at least 3 characters long.' });
      return;
    }

    if (newAdminPass !== confirmAdminPass) {
      setAdminPassMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    const ok = await updateAdminPassword(newAdminPass);
    if (ok) {
      setAdminPassMsg({ type: 'success', text: 'Admin password updated and synced across all devices!' });
      setNewAdminPass('');
      setConfirmAdminPass('');
    } else {
      setAdminPassMsg({ type: 'error', text: 'Failed to update Admin password on server.' });
    }
  };

  const handleUpdateITPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setITPassMsg(null);

    if (newITPass.length < 3) {
      setITPassMsg({ type: 'error', text: 'IT password must be at least 3 characters long.' });
      return;
    }

    if (newITPass !== confirmITPass) {
      setITPassMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    const ok = await updateITPassword(newITPass);
    if (ok) {
      setITPassMsg({ type: 'success', text: 'IT Master password updated successfully!' });
      setNewITPass('');
      setConfirmITPass('');
    } else {
      setITPassMsg({ type: 'error', text: 'Failed to update IT password on server.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl overflow-hidden text-[#DEDEDE]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#4D4D4D]/70 bg-[#242424]/60">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl border"
              style={{
                backgroundColor: 'var(--clash-primary-subtle)',
                borderColor: 'var(--clash-primary-glow)',
                color: 'var(--clash-primary)',
              }}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">IT Master Control Panel</h2>
                <span
                  className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-black badge-it"
                  style={{ backgroundColor: 'var(--clash-primary)' }}
                >
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-[#8C8C8C] mt-0.5">Security, credentials &amp; permissions management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#DEDEDE] hover:text-white p-1.5 rounded-xl hover:bg-[#2A2A2A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#4D4D4D]/60 bg-[#1A1A1A] p-1.5 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('admin_pass')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'admin_pass'
                ? 'bg-[#242424] text-white border border-[#4D4D4D]'
                : 'text-[#8C8C8C] hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-[#F25623]" />
            <span>Admin Password</span>
          </button>

          <button
            onClick={() => setActiveTab('it_pass')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'it_pass'
                ? 'bg-[#242424] text-white border border-[#4D4D4D]'
                : 'text-[#8C8C8C] hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-[#F25623]" />
            <span>IT Password</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'system'
                ? 'bg-[#242424] text-white border border-[#4D4D4D]'
                : 'text-[#8C8C8C] hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-[#F25623]" />
            <span>System Status</span>
          </button>
        </div>

        {/* Tab 1: Manage Admin Password */}
        {activeTab === 'admin_pass' && (
          <div className="p-6 space-y-5">
            {/* Current Admin Password Banner */}
            <div className="p-3.5 rounded-2xl bg-[#242424] border border-[#4D4D4D]/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#8C8C8C] block">Current Admin Passcode:</span>
                <span className="text-sm font-mono font-bold text-white tracking-wider">
                  {showAdminCurrent ? authSettings.adminPassword : '••••••••'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminCurrent(!showAdminCurrent)}
                className="p-1.5 rounded-lg text-[#8C8C8C] hover:text-white hover:bg-[#2E2E2E]"
                title={showAdminCurrent ? 'Hide' : 'Reveal'}
              >
                {showAdminCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Change Admin Password Form */}
            <form onSubmit={handleUpdateAdminPassword} className="space-y-4">
              <div className="text-xs text-[#8C8C8C]">
                As IT, you can change the Admin/Cashier password here. The new password will take effect immediately across all lounge screens.
              </div>

              {adminPassMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    adminPassMsg.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                  }`}
                >
                  {adminPassMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{adminPassMsg.text}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#DEDEDE]">New Admin Password:</label>
                <input
                  type="text"
                  required
                  placeholder="Enter new admin passcode"
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs placeholder-[#8C8C8C] focus:outline-none focus:border-[#F25623]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#DEDEDE]">Confirm New Admin Password:</label>
                <input
                  type="text"
                  required
                  placeholder="Confirm new admin passcode"
                  value={confirmAdminPass}
                  onChange={(e) => setConfirmAdminPass(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs placeholder-[#8C8C8C] focus:outline-none focus:border-[#F25623]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white font-bold text-xs shadow-md shadow-[#F25623]/25 transition-all active:scale-95"
              >
                Save New Admin Password
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Manage IT Password */}
        {activeTab === 'it_pass' && (
          <div className="p-6 space-y-5">
            {/* Current IT Password Banner */}
            <div className="p-3.5 rounded-2xl bg-[#242424] border border-[#4D4D4D]/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#8C8C8C] block">Current IT Master Passcode:</span>
                <span className="text-sm font-mono font-bold text-[#F25623] tracking-wider">
                  {showITCurrent ? authSettings.itPassword : '••••••••'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowITCurrent(!showITCurrent)}
                className="p-1.5 rounded-lg text-[#8C8C8C] hover:text-white hover:bg-[#2E2E2E]"
                title={showITCurrent ? 'Hide' : 'Reveal'}
              >
                {showITCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Change IT Password Form */}
            <form onSubmit={handleUpdateITPassword} className="space-y-4">
              <div className="text-xs text-[#8C8C8C]">
                Change your IT Super Admin passcode. Make sure to keep it safe.
              </div>

              {itPassMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    itPassMsg.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                  }`}
                >
                  {itPassMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{itPassMsg.text}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#DEDEDE]">New IT Master Password:</label>
                <input
                  type="text"
                  required
                  placeholder="Enter new IT passcode"
                  value={newITPass}
                  onChange={(e) => setNewITPass(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs placeholder-[#8C8C8C] focus:outline-none focus:border-[#F25623]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#DEDEDE]">Confirm New IT Password:</label>
                <input
                  type="text"
                  required
                  placeholder="Confirm new IT passcode"
                  value={confirmITPass}
                  onChange={(e) => setConfirmITPass(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs placeholder-[#8C8C8C] focus:outline-none focus:border-[#F25623]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white font-bold text-xs shadow-md shadow-[#F25623]/25 transition-all active:scale-95"
              >
                Save New IT Password
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: System Status */}
        {activeTab === 'system' && (
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="p-3.5 rounded-2xl bg-[#242424] border border-[#4D4D4D]/60 flex items-center justify-between text-xs">
                <span className="text-[#8C8C8C]">Current Active Role:</span>
                <span className="font-bold text-[#F25623]">IT Master (Super Admin)</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#242424] border border-[#4D4D4D]/60 flex items-center justify-between text-xs">
                <span className="text-[#8C8C8C]">Central Database:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Synced (data/lounge-db.json)
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#242424] border border-[#4D4D4D]/60 flex items-center justify-between text-xs">
                <span className="text-[#8C8C8C]">Real-Time Sync:</span>
                <span className="font-bold text-white">SSE + BroadcastChannel Active</span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full border border-[#4D4D4D] bg-[#242424] hover:bg-[#2A2A2A] text-white font-semibold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
