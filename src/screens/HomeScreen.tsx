import React from 'react';
import {
  Play,
  Gamepad2,
  Trophy,
  Palette,
  BarChart3,
  Settings,
  Flame,
  Sparkles,
  User,
  RotateCcw,
  X,
  Sliders,
} from 'lucide-react';
import { PlayerStats, GameSettings, SavedGameState } from '../game/types';
import { getAssetUrl } from '../utils/assets';

interface HomeScreenProps {
  stats: PlayerStats;
  settings: GameSettings;
  activeUsername: string | null;
  savedGame: SavedGameState | null;
  startingLevel: number;
  onChangeStartingLevel: (lvl: number) => void;
  onResumeSavedGame: () => void;
  onDiscardSavedGame: () => void;
  onPlayQuick: () => void;
  onOpenModes: () => void;
  onOpenAchievements: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stats,
  settings,
  activeUsername,
  savedGame,
  startingLevel,
  onChangeStartingLevel,
  onResumeSavedGame,
  onDiscardSavedGame,
  onPlayQuick,
  onOpenModes,
  onOpenAchievements,
  onOpenStats,
  onOpenSettings,
  onOpenProfile,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col items-center justify-between p-4 max-w-4xl mx-auto overflow-hidden">
      {/* Decorative floating Dhokla cubes in background */}
      {!settings.reducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <img
            src={getAssetUrl('assets/dhokla/dhokla-block.png')}
            alt=""
            className="absolute top-12 left-6 w-16 h-16 opacity-20 animate-bounce-subtle duration-1000 rotate-12"
          />
          <img
            src={getAssetUrl('assets/dhokla/dhokla-block.png')}
            alt=""
            className="absolute top-28 right-8 w-20 h-20 opacity-20 animate-pulse-glow rotate-[-15deg]"
          />
          <img
            src={getAssetUrl('assets/dhokla/dhokla-khaman.png')}
            alt=""
            className="absolute bottom-24 left-10 w-24 h-24 opacity-15 rotate-45"
          />
          <img
            src={getAssetUrl('assets/dhokla/dhokla-spicy.png')}
            alt=""
            className="absolute bottom-16 right-12 w-16 h-16 opacity-20 rotate-[-25deg]"
          />
        </div>
      )}

      {/* Hero Title Section */}
      <div className="flex flex-col items-center text-center mt-6 sm:mt-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dhokla-500/15 border border-dhokla-500/30 text-dhokla-golden text-xs font-bold tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GUJARATI FALLING-BLOCK ARCADE</span>
        </div>

        {/* Brand Dhoklaris Logo */}
        <div className="relative mb-2">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(244,196,48,0.4)]">
            <span className="bg-gradient-to-br from-yellow-200 via-dhokla-golden to-saffron bg-clip-text text-transparent">
              DHOKLARIS
            </span>
          </h1>
          {/* Garnish leaf accent */}
          <span className="absolute -top-1 -right-3 sm:-right-4 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-curry-lime/80 shadow-md shadow-curry-lime/40 animate-pulse" />
        </div>

        {/* Tagline */}
        <p className="text-base sm:text-xl font-bold text-dhokla-100 tracking-wide mb-1">
          Stack It. Spice It. Smash It!
        </p>
        <p className="text-xs sm:text-sm text-slate-400 italic font-medium">
          &ldquo;Too Much Dhokla? Never!&rdquo;
        </p>

        {/* Player Profile & Best Score Summary Banner */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {/* Active Chef Account Pill */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slatebg-card hover:bg-slate-800 border border-dhokla-500/40 text-xs text-dhokla-golden font-bold transition-all shadow-sm"
          >
            <User className="w-3.5 h-3.5" />
            <span>{activeUsername ? `Chef ${activeUsername}` : 'Sign In / Register'}</span>
            <span className="text-[10px] text-slate-400 font-normal">
              {activeUsername ? '· Profile' : '· Claim Name'}
            </span>
          </button>

          <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-slatebg-card/70 border border-slatebg-border text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-1.5 text-dhokla-golden font-bold">
              <Trophy className="w-4 h-4 text-dhokla-golden" />
              <span>Classic Best:</span>
            </div>
            <span className="font-black font-mono text-white">
              {stats.classicBestScore.toLocaleString()} pts
            </span>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1 text-saffron-glow font-bold">
              <Flame className="w-4 h-4" />
              <span>{stats.tadkaPoints} Tadka Pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3 my-6 sm:my-8">
        {/* In-Progress Game Resume Card */}
        {savedGame && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-dhokla-900/60 via-slatebg-card to-saffron/20 border-2 border-dhokla-500/80 shadow-lg shadow-dhokla-500/20 flex items-center justify-between gap-3 animate-pulse">
            <div>
              <span className="text-[10px] uppercase font-black text-dhokla-golden tracking-wider block">
                UNFINISHED GAME SAVED
              </span>
              <span className="text-sm font-black text-white">
                Level {savedGame.level} · {savedGame.score.toLocaleString()} pts
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onResumeSavedGame}
                className="py-1.5 px-3 rounded-xl bg-dhokla-golden hover:bg-dhokla-400 text-slate-950 font-black text-xs shadow-md"
              >
                RESUME
              </button>
              <button
                onClick={onDiscardSavedGame}
                title="Discard saved game"
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Starting Level Selector (Unlockable up to Highest Level Reached) */}
        {stats.highestLevel > 1 && (
          <div className="p-2.5 rounded-xl bg-slatebg-card border border-slatebg-border/80 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-dhokla-golden" />
                <span>Start from Level</span>
              </span>
              <span className="font-mono text-dhokla-golden font-black">
                Level {startingLevel} (Unlocked: {stats.highestLevel})
              </span>
            </div>
            <input
              type="range"
              min="1"
              max={stats.highestLevel}
              value={startingLevel}
              onChange={e => onChangeStartingLevel(parseInt(e.target.value))}
              className="w-full accent-dhokla-golden cursor-pointer h-1.5"
            />
          </div>
        )}

        {/* Giant PLAY Button */}
        <button
          onClick={onPlayQuick}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-dhokla-500 via-dhokla-golden to-saffron hover:brightness-110 active:scale-98 text-slate-950 font-black text-xl sm:text-2xl tracking-wider shadow-xl shadow-dhokla-500/30 flex items-center justify-center gap-3 transition-all"
        >
          <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-slate-950" />
          <span>{startingLevel > 1 ? `PLAY (LEVEL ${startingLevel})` : 'PLAY NOW'}</span>
        </button>

        {/* Game Modes Button */}
        <button
          onClick={onOpenModes}
          className="w-full py-3 px-5 rounded-xl bg-slatebg-card/90 hover:bg-slatebg-card border border-slatebg-border hover:border-dhokla-500/50 text-slate-100 font-bold text-sm sm:text-base flex items-center justify-between shadow-md transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="w-5 h-5 text-dhokla-golden" />
            <span>Game Modes</span>
          </div>
          <span className="text-xs text-dhokla-300 bg-dhokla-500/15 px-2 py-0.5 rounded font-mono font-bold">
            7 Modes
          </span>
        </button>

        {/* Dhokla Masters Club (Achievements) */}
        <button
          onClick={onOpenAchievements}
          className="w-full py-3 px-5 rounded-xl bg-slatebg-card/90 hover:bg-slatebg-card border border-slatebg-border hover:border-saffron/50 text-slate-100 font-bold text-sm sm:text-base flex items-center justify-between shadow-md transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-saffron" />
            <span>Dhokla Masters Club</span>
          </div>
          <span className="text-xs text-saffron-glow bg-saffron/15 px-2 py-0.5 rounded font-mono font-bold">
            Rewards & Skins
          </span>
        </button>

        {/* Player Profile & Stats */}
        <button
          onClick={onOpenStats}
          className="w-full py-3 px-5 rounded-xl bg-slatebg-card/90 hover:bg-slatebg-card border border-slatebg-border hover:border-curry-light text-slate-100 font-bold text-sm sm:text-base flex items-center justify-between shadow-md transition-all"
        >
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-curry-lime" />
            <span>Player Statistics</span>
          </div>
          <span className="text-xs text-curry-lime bg-curry-leaf/30 px-2 py-0.5 rounded font-mono font-bold">
            {stats.gamesPlayed} Games
          </span>
        </button>
      </div>

      {/* Footer controls & credits */}
      <div className="w-full flex items-center justify-between text-xs text-slate-500 border-t border-slatebg-border/60 pt-3">
        <div className="flex items-center gap-1 font-medium">
          <span>Title:</span>
          <span className="text-dhokla-golden font-bold">{settings.playerTitle}</span>
        </div>

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1 hover:text-slate-300 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};
