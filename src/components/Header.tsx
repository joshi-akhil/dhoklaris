import React from 'react';
import { Volume2, VolumeX, Pause, Settings, Flame, Trophy, User } from 'lucide-react';
import { GameModeId } from '../game/types';
import { GAME_MODES } from '../game/modes';
import { getAssetUrl } from '../utils/assets';

interface HeaderProps {
  currentMode?: GameModeId;
  tadkaPoints: number;
  activeUsername?: string | null;
  onOpenProfile?: () => void;
  sfxEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onPause?: () => void;
  isPlaying?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  tadkaPoints,
  activeUsername,
  onOpenProfile,
  sfxEnabled,
  onToggleSound,
  onOpenSettings,
  onPause,
  isPlaying = false,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 bg-slatebg-card/80 backdrop-blur-md border-b border-slatebg-border sticky top-0 z-30">
      {/* Brand & Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-dhokla-500/40 shadow-sm shadow-dhokla-500/20 bg-black/40 flex items-center justify-center">
          <img
            src={getAssetUrl('assets/dhokla/dhokla-block-small.png')}
            alt="Dhokla"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-dhokla-300 via-dhokla-golden to-saffron bg-clip-text text-transparent">
              DHOKLARIS
            </h1>
            <span className="inline-block w-2 h-2 rounded-full bg-curry-lime shadow-sm shadow-curry-lime" />
          </div>
          <p className="text-[10px] sm:text-xs text-dhokla-200/70 font-medium tracking-tight">
            {currentMode ? GAME_MODES[currentMode].name : 'Stack It. Spice It. Smash It!'}
          </p>
        </div>
      </div>

      {/* Tadka Points & Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Active Chef Profile or Login Button */}
        {onOpenProfile && (
          <button
            onClick={onOpenProfile}
            title={activeUsername ? `Logged in as Chef ${activeUsername}` : 'Sign In or Create Chef Profile'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slatebg-darkest border border-dhokla-500/40 text-dhokla-golden text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
          >
            <User className="w-3 h-3 text-dhokla-golden" />
            <span className="max-w-[110px] truncate">
              {activeUsername ? activeUsername : 'Sign In'}
            </span>
          </button>
        )}

        {/* Tadka Points Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-saffron/15 border border-saffron/30 text-saffron-glow font-bold text-xs sm:text-sm">
          <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-saffron fill-saffron animate-pulse" />
          <span>{tadkaPoints.toLocaleString()}</span>
        </div>

        {/* Quick Sound Toggle */}
        <button
          onClick={onToggleSound}
          aria-label={sfxEnabled ? 'Mute sound' : 'Unmute sound'}
          className="p-1.5 sm:p-2 rounded-lg bg-slatebg-darkest/70 border border-slatebg-border hover:border-dhokla-500/50 text-slate-300 hover:text-dhokla-golden transition-all"
        >
          {sfxEnabled ? (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
          )}
        </button>

        {/* Pause Button (Visible during active gameplay) */}
        {isPlaying && onPause && (
          <button
            onClick={onPause}
            aria-label="Pause game"
            className="p-1.5 sm:p-2 rounded-lg bg-dhokla-500/20 border border-dhokla-500/50 hover:bg-dhokla-500/30 text-dhokla-golden transition-all"
          >
            <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          aria-label="Game settings"
          className="p-1.5 sm:p-2 rounded-lg bg-slatebg-darkest/70 border border-slatebg-border hover:border-dhokla-500/50 text-slate-300 hover:text-dhokla-golden transition-all"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </header>
  );
};
