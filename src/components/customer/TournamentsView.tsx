'use client';

import React, { useState } from 'react';
import { Trophy, Calendar, DollarSign, Users, PlusCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { useLounge } from '../../context/LoungeContext';
import { formatCurrency } from '../../lib/calculations';

export const TournamentsView: React.FC = () => {
  const { tournaments, addTournamentParticipant } = useLounge();
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournament || !name || !phone) return;

    addTournamentParticipant(selectedTournament, name, phone);
    setName('');
    setPhone('');
    setSelectedTournament(null);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 4000);
  };

  return (
    <div className="space-y-6 text-[#DEDEDE]">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-[#1E1E1E] p-6 md:p-8 border border-[#4D4D4D] shadow-2xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F25623]/15 text-[#F25623] border border-[#F25623]/30 text-xs font-bold mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>Clash Tournaments &amp; Challenges</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-baseline gap-2">
            PlayStation Leagues &amp; Tournaments
          </h1>
          <p className="text-xs md:text-sm text-[#8C8C8C] mt-1 max-w-xl">
            Compete in EA FC 25, Tekken 8, and PES tournaments. Challenge the best players and win cash prizes!
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Registration successful! We will contact you via WhatsApp with your match schedule.</span>
        </div>
      )}

      {/* Tournaments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tournaments.map((t) => (
          <div
            key={t.id}
            className="rounded-3xl bg-[#1E1E1E] border border-[#4D4D4D] p-6 space-y-4 shadow-xl flex flex-col justify-between hover:border-[#8C8C8C] transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#242424] text-[#F25623] border border-[#4D4D4D]">
                    {t.game}
                  </span>
                  <h3 className="text-lg font-black text-white mt-2">{t.title}</h3>
                </div>
                <Trophy className="w-8 h-8 text-[#F25623]" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-3 rounded-2xl bg-[#242424] border border-[#4D4D4D]/60">
                  <span className="text-[#8C8C8C] block text-[10px] mb-0.5">Date &amp; Time:</span>
                  <span className="font-bold text-white">{t.date}</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#242424] border border-[#4D4D4D]/60">
                  <span className="text-[#8C8C8C] block text-[10px] mb-0.5">Entry Fee:</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(t.entryFee)}</span>
                </div>
              </div>

              {/* Prize Pool */}
              <div className="p-3.5 rounded-2xl bg-[#242424] border border-[#4D4D4D] flex items-center justify-between text-xs">
                <span className="text-[#F25623] font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Prizes:
                </span>
                <span className="text-white font-extrabold">{t.prizePool}</span>
              </div>

              {/* Participants */}
              <div className="space-y-1.5 pt-2 border-t border-[#4D4D4D]/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8C8C8C] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#8C8C8C]" />
                    Registered Players:
                  </span>
                  <span className="text-white font-bold">{t.participants.length} players</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {t.participants.map((p) => (
                    <span
                      key={p.id}
                      className="text-[11px] px-2.5 py-0.5 rounded-xl bg-[#242424] text-[#DEDEDE] border border-[#4D4D4D]/60"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTournament(t.id)}
              className="mt-4 w-full py-3 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#F25623]/25 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register for Tournament Now</span>
            </button>
          </div>
        ))}
      </div>

      {/* REGISTRATION MODAL */}
      {selectedTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-[#1E1E1E] border border-[#4D4D4D] p-6 space-y-4 text-[#DEDEDE] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#4D4D4D]/60">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#F25623]" />
                <span>Tournament Registration</span>
              </h3>
              <button
                onClick={() => setSelectedTournament(null)}
                className="text-[#8C8C8C] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs text-[#DEDEDE] font-semibold mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Youssef Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs placeholder-[#8C8C8C] focus:border-[#F25623] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#DEDEDE] font-semibold mb-1">WhatsApp Mobile Number:</label>
                <input
                  type="tel"
                  required
                  placeholder="01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs placeholder-[#8C8C8C] focus:border-[#F25623] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedTournament(null)}
                  className="flex-1 py-2.5 rounded-full bg-[#242424] border border-[#4D4D4D] text-[#8C8C8C] text-xs font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-bold shadow-md shadow-[#F25623]/25"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
