import React from 'react';
import { Trophy, Zap, Layers, Timer, Flame } from 'lucide-react';
import { GameModeId } from '../game/types';

interface StatsPanelProps {
  modeId: GameModeId;
  score: number;
  level: number;
  lines: number;
  combo: number;
  bestScore: number;
  elapsedSeconds: number;
  timeRemainingSeconds?: number;
  targetLines?: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  modeId,
  score,
  level,
  lines,
  combo,
  bestScore,
  elapsedSeconds,
  timeRemainingSeconds,
  targetLines,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slatebg-card/90 border border-slatebg-border rounded-xl p-3 flex flex-col gap-2.5 shadow-md">
      {/* Score Card */}
      <div className="bg-slatebg-darkest/70 rounded-lg p-2 border border-slatebg-border/60">
        <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
          <span>Score</span>
          <span className="text-dhokla-golden text-[9px] flex items-center gap-0.5">
            <Trophy className="w-2.5 h-2.5" /> Best {bestScore.toLocaleString()}
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-black text-dhokla-100 font-mono tracking-tight">
          {score.toLocaleString()}
        </div>
      </div>

      {/* Level & Lines row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slatebg-darkest/60 rounded-lg p-2 border border-slatebg-border/50">
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
            <Layers className="w-3 h-3 text-dhokla-400" />
            <span>Level</span>
          </div>
          <div className="text-lg font-black text-dhokla-golden font-mono">
            {level}
          </div>
        </div>

        <div className="bg-slatebg-darkest/60 rounded-lg p-2 border border-slatebg-border/50">
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
            <Zap className="w-3 h-3 text-curry-lime" />
            <span>Lines</span>
          </div>
          <div className="text-lg font-black text-curry-lime font-mono">
            {targetLines ? `${lines}/${targetLines}` : lines}
          </div>
        </div>
      </div>

      {/* Timer / Sprint / Ultra Card */}
      <div className="bg-slatebg-darkest/60 rounded-lg p-2 border border-slatebg-border/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
          <Timer className="w-3.5 h-3.5 text-saffron" />
          <span>{timeRemainingSeconds !== undefined ? 'Time Left' : 'Time'}</span>
        </div>
        <div className="text-sm font-black text-slate-200 font-mono">
          {timeRemainingSeconds !== undefined
            ? formatTime(timeRemainingSeconds)
            : formatTime(elapsedSeconds)}
        </div>
      </div>

      {/* Combo meter (if active) */}
      {combo > 0 && (
        <div className="bg-saffron/20 border border-saffron/40 rounded-lg p-1.5 flex items-center justify-between animate-pulse">
          <span className="flex items-center gap-1 text-[11px] font-black text-saffron-glow">
            <Flame className="w-3.5 h-3.5 fill-saffron" /> SPICY COMBO!
          </span>
          <span className="text-xs font-black text-white bg-saffron px-1.5 py-0.2 rounded font-mono">
            x{combo}
          </span>
        </div>
      )}
    </div>
  );
};
