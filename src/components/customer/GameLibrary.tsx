'use client';

import React, { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { useLounge } from '../../context/LoungeContext';

export const GameLibrary: React.FC = () => {
  const { games, devices } = useLounge();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            Search games and see which consoles have them installed
          </p>
        </div>

        <span className="text-xs text-[#8C8C8C] font-bold bg-[#1E1E1E] border border-[#4D4D4D] px-3.5 py-1.5 rounded-full w-fit">
          {filteredGames.length} games available
        </span>
      </div>

      {/* Search Input (No Category Tabs) */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-[#8C8C8C] absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search games (e.g. FC 25, GTA, Tekken...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-3 pl-10 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#4D4D4D] text-white text-xs placeholder-[#8C8C8C] focus:outline-none focus:border-[#F25623] transition-colors"
        />
      </div>

      {/* Games Grid (Text/Card Minimal without images) */}
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
                  <h3 className="font-bold text-base text-white">{game.title}</h3>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#242424] border border-[#4D4D4D] text-[#DEDEDE] font-semibold whitespace-nowrap">
                    {game.psVersion}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#8C8C8C]">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#8C8C8C]" />
                    {game.playersCount}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#4D4D4D]/50 space-y-1.5 text-xs">
                <div className="text-[#8C8C8C] font-semibold">Available on ({devicesWithGame.length}):</div>
                <div className="flex flex-wrap gap-1.5">
                  {devicesWithGame.length === 0 ? (
                    <span className="text-[#8C8C8C]/60 text-[11px]">Not currently installed</span>
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
    </div>
  );
};
