'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, KeyRound, ArrowRight, Eye, EyeOff, ShieldAlert, CheckCircle2, Tv } from 'lucide-react';
import { useLounge } from '../../context/LoungeContext';
import { UserRole } from '../../types';

export const AuthLockScreen: React.FC = () => {
  const { login } = useLounge();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccessRole, setLoginSuccessRole] = useState<UserRole | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await login(password);
      if (res.success && res.role) {
        setLoginSuccessRole(res.role);
      } else {
        setIsSubmitting(false);
        setErrorMsg(res.error || 'Invalid password.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Connection error during authentication.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl p-6 sm:p-8 space-y-6 text-[#DEDEDE] relative overflow-hidden">
        
        {/* Subtle orange accent glow at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#F25623] to-transparent rounded-full opacity-80" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#242424] border border-[#4D4D4D] shadow-inner mb-2">
            <Lock className="w-7 h-7 text-[#F25623]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center">
            Clash<span className="text-[#F25623]">.</span>
          </h1>
          <p className="text-xs text-[#8C8C8C] uppercase tracking-wider font-bold">
            Staff &amp; Operations Access
          </p>
          <p className="text-xs text-[#8C8C8C]/80 max-w-xs mx-auto">
            Please enter your password to unlock Admin console controls and cashier POS
          </p>
        </div>

        {/* Success Splash */}
        {loginSuccessRole ? (
          <div className="p-4 rounded-2xl bg-[#242424] border border-[#F25623]/60 flex items-center gap-3 text-center justify-center animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-bold text-white">
              Authenticated as {loginSuccessRole === 'it' ? 'IT Master Tech' : 'Admin'}! Loading...
            </span>
          </div>
        ) : (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-4">
            
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#DEDEDE] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#F25623]" />
                  <span>Password</span>
                </span>
                <span className="text-[10px] text-[#8C8C8C]">Admin or IT</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="Enter passcode..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="w-full p-3.5 pr-11 rounded-2xl bg-[#242424] border border-[#4D4D4D] text-white text-sm placeholder-[#8C8C8C] focus:outline-none focus:border-[#F25623] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-white p-1 rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-[#F25623] hover:bg-[#E04816] text-white font-bold text-sm shadow-lg shadow-[#F25623]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>Unlock System</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#4D4D4D]/50" />
          <span className="flex-shrink mx-3 text-[11px] text-[#8C8C8C] uppercase font-bold tracking-wider">
            Public Screen
          </span>
          <div className="flex-grow border-t border-[#4D4D4D]/50" />
        </div>

        {/* Link to Customer View (No Password) */}
        <div className="text-center">
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-2xl border border-[#4D4D4D] bg-[#242424] hover:bg-[#2A2A2A] text-[#DEDEDE] hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Tv className="w-4 h-4 text-[#F25623]" />
            <span>Continue as Customer (No Password Required)</span>
          </Link>
          <p className="text-[10px] text-[#8C8C8C] mt-2">
            Customers can freely browse available consoles, games library, and cafe menu
          </p>
        </div>

      </div>
    </div>
  );
};
