'use client';

import React, { useState } from 'react';
import { Search, Plus, Trash2, Users } from 'lucide-react';
import { useLounge } from '../../../context/LoungeContext';
import { Game } from '../../../types';

export default function AdminGamesPage() {
  const { games, devices, addGame, deleteGame } = useLounge();
  const [searchQuery, setSearchQuery] = useState('');

  // Add game modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [psVersion, setPsVersion] = useState<Game['psVersion']>('Both');
  const [playersCount, setPlayersCount] = useState('1 - 4 Players');

  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddGameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addGame({
      title: title.trim(),
      genre: '',
      psVersion,
      playersCount,
      image: '',
      isPopular: false,
    });

    setTitle('');
    setShowAddModal(false);
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
            <span className="text-xs font-bold text-[#8C8C8C] uppercase tracking-wider">Games Library</span>
          </div>
          <p className="text-xs text-[#8C8C8C] mt-1">
            Manage game library and console installations
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#F25623]/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Game</span>
        </button>
      </div>

      {/* Search Input (No Category Tabs) */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-[#8C8C8C] absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search games..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-3 pl-10 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#4D4D4D] text-white text-xs placeholder-[#8C8C8C] focus:outline-none focus:border-[#F25623] transition-colors"
        />
      </div>

      {/* Games List (Minimal Cards Without Images) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGames.map((game) => {
          const devicesWithGame = devices.filter((d) => d.games.includes(game.id));

          return (
            <div
              key={game.id}
              className="p-5 rounded-3xl bg-[#1E1E1E] border border-[#4D4D4D] shadow-xl flex flex-col justify-between space-y-4 hover:border-[#8C8C8C] transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-white">{game.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-[#8C8C8C] mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#8C8C8C]" />
                        {game.playersCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#242424] border border-[#4D4D4D] text-[#DEDEDE] font-semibold whitespace-nowrap">
                      {game.psVersion}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${game.title}"?`)) {
                          deleteGame(game.id);
                        }
                      }}
                      title="Delete Game"
                      className="text-[#8C8C8C] hover:text-rose-500 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#4D4D4D]/50 space-y-1.5 text-xs">
                <div className="text-[#8C8C8C] font-semibold">Installed on ({devicesWithGame.length}):</div>
                <div className="flex flex-wrap gap-1.5">
                  {devicesWithGame.length === 0 ? (
                    <span className="text-[#8C8C8C]/60 text-[11px]">Not installed yet</span>
                  ) : (
                    devicesWithGame.map((d) => (
                      <span
                        key={d.id}
                        className="text-[11px] px-2.5 py-0.5 rounded-xl bg-[#242424] border border-[#4D4D4D]/60 text-white font-medium"
                      >
                        {d.name.split('(')[0].trim()}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD GAME */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl p-6 space-y-4 text-[#DEDEDE]">
            <div className="flex items-center justify-between pb-3 border-b border-[#4D4D4D]/60">
              <h3 className="text-base font-bold text-white">Add New Game</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#8C8C8C] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGameSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Game Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EA SPORTS FC 25, GTA V..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs placeholder-[#8C8C8C] focus:outline-none focus:border-[#F25623]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Compatibility:</label>
                  <select
                    value={psVersion}
                    onChange={(e) => setPsVersion(e.target.value as Game['psVersion'])}
                    className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs focus:outline-none focus:border-[#F25623]"
                  >
                    <option value="Both">Both (PS4 & PS5)</option>
                    <option value="PS5">PlayStation 5 Only</option>
                    <option value="PS4">PlayStation 4 Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#DEDEDE] mb-1">Players Count:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 - 4 Players"
                    value={playersCount}
                    onChange={(e) => setPlayersCount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#242424] border border-[#4D4D4D] text-white text-xs placeholder-[#8C8C8C] focus:outline-none focus:border-[#F25623]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-full border border-[#4D4D4D] bg-[#242424] text-[#8C8C8C] hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#F25623] hover:bg-[#E04816] text-white text-xs font-bold shadow-md shadow-[#F25623]/25"
                >
                  Add Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
