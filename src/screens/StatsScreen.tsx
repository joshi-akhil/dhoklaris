import React from 'react';
import {
  ArrowLeft,
  Trophy,
  Flame,
  Zap,
  Layers,
  Timer,
  Clock,
  Award,
} from 'lucide-react';
import { PlayerStats, GameSettings } from '../game/types';
import { getAssetUrl } from '../utils/assets';

interface StatsScreenProps {
  stats: PlayerStats;
  settings: GameSettings;
  onBack: () => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({
  stats,
  settings,
  onBack,
}) => {
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 min-h-[calc(100vh-65px)] flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slatebg-card hover:bg-slate-800 text-slate-300 border border-slatebg-border text-xs sm:text-sm font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
          PLAYER PROFILE & STATS
        </h2>

        <div className="w-20" />
      </div>

      {/* Profile Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slatebg-card via-slatebg-card to-dhokla-950/30 border border-dhokla-500/40 shadow-lg mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-2xl bg-black/60 border-2 border-dhokla-500/50 p-1 flex items-center justify-center">
            <img
              src={getAssetUrl('assets/dhokla/dhokla-block.png')}
              alt="Avatar"
              className="w-12 h-12 object-contain"
            />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-dhokla-golden bg-dhokla-500/15 px-2 py-0.5 rounded-full border border-dhokla-500/30">
              {settings.playerTitle}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              Dhokla Master
            </h3>
            <p className="text-xs text-slate-400">
              Certified Gujarati Tetromino Baker
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slatebg-darkest/70 px-4 py-2.5 rounded-xl border border-slatebg-border">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Tadka Pts
            </span>
            <span className="text-lg font-black text-saffron-glow font-mono">
              {stats.tadkaPoints.toLocaleString()}
            </span>
          </div>
          <div className="w-px h-8 bg-slatebg-border" />
          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Total Playtime
            </span>
            <span className="text-lg font-black text-slate-200 font-mono">
              {formatTime(stats.totalPlaytimeSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Lifetime Records Grid */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
          Lifetime Milestones
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slatebg-card border border-slatebg-border">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-1">
              <Trophy className="w-4 h-4 text-dhokla-golden" />
              <span>Highest Score</span>
            </div>
            <div className="text-xl font-black text-white font-mono">
              {stats.highestScore.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slatebg-card border border-slatebg-border">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-1">
              <Zap className="w-4 h-4 text-curry-lime" />
              <span>Total Lines</span>
            </div>
            <div className="text-xl font-black text-white font-mono">
              {stats.linesCleared.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slatebg-card border border-slatebg-border">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-1">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Highest Level</span>
            </div>
            <div className="text-xl font-black text-white font-mono">
              {stats.highestLevel}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slatebg-card border border-slatebg-border">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-1">
              <Flame className="w-4 h-4 text-saffron" />
              <span>Best Combo</span>
            </div>
            <div className="text-xl font-black text-white font-mono">
              x{stats.bestCombo}
            </div>
          </div>
        </div>
      </div>

      {/* Mode Best Records */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
          Records by Mode
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-8">
          <div className="p-3.5 rounded-xl bg-slatebg-card border border-slatebg-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-dhokla-golden" />
              <div>
                <span className="text-sm font-bold text-white block">Classic Dhoklaris</span>
                <span className="text-xs text-slate-400">High Score Record</span>
              </div>
            </div>
            <span className="text-lg font-black text-dhokla-golden font-mono">
              {stats.classicBestScore.toLocaleString()} pts
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slatebg-card border border-slatebg-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Timer className="w-5 h-5 text-curry-lime" />
              <div>
                <span className="text-sm font-bold text-white block">Sprint (40 Lines)</span>
                <span className="text-xs text-slate-400">Fastest Clear Time</span>
              </div>
            </div>
            <span className="text-lg font-black text-curry-lime font-mono">
              {stats.sprintBestTimeSeconds !== null
                ? `${stats.sprintBestTimeSeconds.toFixed(2)}s`
                : '—'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slatebg-card border border-slatebg-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-saffron" />
              <div>
                <span className="text-sm font-bold text-white block">Ultra (2 Minutes)</span>
                <span className="text-xs text-slate-400">Blitz High Score</span>
              </div>
            </div>
            <span className="text-lg font-black text-saffron-glow font-mono">
              {stats.ultraBestScore.toLocaleString()} pts
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slatebg-card border border-slatebg-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-red-500 fill-red-500" />
              <div>
                <span className="text-sm font-bold text-white block">Rising Heat</span>
                <span className="text-xs text-slate-400">Extreme Survival Score</span>
              </div>
            </div>
            <span className="text-lg font-black text-red-400 font-mono">
              {stats.risingHeatBestScore.toLocaleString()} pts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
