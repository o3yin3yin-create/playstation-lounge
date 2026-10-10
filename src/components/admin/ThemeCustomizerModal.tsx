'use client';

import React, { useState } from 'react';
import { 
  X, 
  Palette, 
  RotateCcw, 
  Check, 
  Sparkles,
  Tv,
  CheckCircle2
} from 'lucide-react';
import { useLounge } from '../../context/LoungeContext';
import { 
  THEME_PRESETS, 
  defaultThemeSettings, 
  ThemePreset 
} from '../../lib/calculations';
import { ThemeSettings } from '../../types';

interface ThemeCustomizerModalProps {
  onClose: () => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({ onClose }) => {
  const { theme, updateTheme } = useLounge();

  const [primaryColor, setPrimaryColor] = useState(theme.primaryColor || '#F25623');
  const [backgroundColor, setBackgroundColor] = useState(theme.backgroundColor || '#171717');
  const [surfaceColor, setSurfaceColor] = useState(theme.surfaceColor || '#1E1E1E');
  const [activePreset, setActivePreset] = useState<string>(theme.presetName || 'Clash Orange');
  const [savedAlert, setSavedAlert] = useState(false);

  // Apply preset
  const handleSelectPreset = (preset: ThemePreset) => {
    setActivePreset(preset.name);
    setPrimaryColor(preset.primaryColor);
    setBackgroundColor(preset.backgroundColor);
    setSurfaceColor(preset.surfaceColor);

    const newTheme: ThemeSettings = {
      primaryColor: preset.primaryColor,
      backgroundColor: preset.backgroundColor,
      surfaceColor: preset.surfaceColor,
      cardColor: preset.cardColor,
      borderColor: preset.borderColor,
      presetName: preset.name,
    };
    updateTheme(newTheme);
    triggerSavedFeedback();
  };

  // Custom Primary Color change
  const handlePrimaryChange = (color: string) => {
    setPrimaryColor(color);
    setActivePreset('Custom');
    const newTheme: ThemeSettings = {
      ...theme,
      primaryColor: color,
      presetName: 'Custom',
    };
    updateTheme(newTheme);
  };

  // Custom Background Color change
  const handleBackgroundChange = (color: string) => {
    setBackgroundColor(color);
    setActivePreset('Custom');
    const newTheme: ThemeSettings = {
      ...theme,
      backgroundColor: color,
      presetName: 'Custom',
    };
    updateTheme(newTheme);
  };

  // Reset to default Clash Orange
  const handleResetDefault = () => {
    setActivePreset('Clash Orange');
    setPrimaryColor(defaultThemeSettings.primaryColor);
    setBackgroundColor(defaultThemeSettings.backgroundColor);
    setSurfaceColor(defaultThemeSettings.surfaceColor);
    updateTheme(defaultThemeSettings);
    triggerSavedFeedback();
  };

  const triggerSavedFeedback = () => {
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#1E1E1E] rounded-3xl border border-[#4D4D4D] shadow-2xl overflow-hidden text-[#DEDEDE] max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#4D4D4D]/70 bg-[#242424]/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#F25623]/15 border border-[#F25623]/30 text-[#F25623]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Global Theme &amp; Colors</h2>
              <p className="text-xs text-[#8C8C8C] mt-0.5">Real-time color synchronization for all users</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#DEDEDE] hover:text-white p-1.5 rounded-xl hover:bg-[#2A2A2A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Live Sync Notice */}
          {savedAlert && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Theme updated and broadcasted to all customer and admin screens!</span>
            </div>
          )}

          {/* Presets Grid */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Curated Theme Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {THEME_PRESETS.map((p) => {
                const isSelected = activePreset === p.name;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'border-white bg-[#2A2A2A] shadow-lg ring-1 ring-white/50'
                        : 'border-[#4D4D4D]/60 bg-[#242424] hover:bg-[#2A2A2A] hover:border-[#8C8C8C]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span 
                        className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-sm"
                        style={{ backgroundColor: p.primaryColor }}
                      />
                      <span 
                        className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: p.backgroundColor }}
                      />
                    </div>
                    <div className="text-[11px] font-bold text-white truncate">
                      {p.name}
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 text-white">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Pickers */}
          <div className="p-4 rounded-2xl bg-[#242424] border border-[#4D4D4D]/60 space-y-4">
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <span>Custom Color Pickers</span>
              <span className="text-[10px] text-[#8C8C8C] font-normal">Pick any custom HEX color</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Primary Accent Color */}
              <div className="p-3 rounded-xl bg-[#1E1E1E] border border-[#4D4D4D]/60 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-white">Accent Color</div>
                  <div className="text-[10px] text-[#8C8C8C]">Buttons, glow &amp; badges</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => handlePrimaryChange(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    {primaryColor}
                  </span>
                </div>
              </div>

              {/* Background Color */}
              <div className="p-3 rounded-xl bg-[#1E1E1E] border border-[#4D4D4D]/60 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-white">Background</div>
                  <div className="text-[10px] text-[#8C8C8C]">Base dark tone</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => handleBackgroundChange(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    {backgroundColor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Sample */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Live Theme Preview
            </label>
            <div 
              className="p-4 rounded-2xl border transition-colors space-y-3"
              style={{ 
                backgroundColor: backgroundColor,
                borderColor: primaryColor,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white">
                    Clash<span style={{ color: primaryColor }}>.</span>
                  </h3>
                  <span 
                    className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-black"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Active Preset: {activePreset}
                  </span>
                </div>
                <span className="text-xs font-bold" style={{ color: primaryColor }}>
                  50 EGP/h
                </span>
              </div>

              <div 
                className="p-3 rounded-xl border flex items-center justify-between text-xs"
                style={{ backgroundColor: surfaceColor, borderColor: '#4D4D4D' }}
              >
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4" style={{ color: primaryColor }} />
                  <span className="text-white font-bold">Screen 1 (PS5)</span>
                </div>
                <button
                  type="button"
                  className="px-3 py-1 rounded-full text-white text-[11px] font-bold shadow-md transition-transform"
                  style={{ backgroundColor: primaryColor }}
                >
                  Start Session
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#4D4D4D]/60 bg-[#242424]/60 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetDefault}
            className="py-2.5 px-4 rounded-full border border-[#4D4D4D] bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#8C8C8C] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerSavedFeedback();
              setTimeout(onClose, 300);
            }}
            className="py-2.5 px-6 rounded-full text-white text-xs font-bold shadow-lg transition-all active:scale-95"
            style={{ backgroundColor: primaryColor }}
          >
            Save &amp; Close
          </button>
        </div>

      </div>
    </div>
  );
};
