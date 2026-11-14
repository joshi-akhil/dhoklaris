import React from 'react';
import {
  RotateCcw,
  Home,
  Gamepad2,
  Trophy,
  Flame,
  Zap,
  Layers,
  Timer,
  Sparkles,
} from 'lucide-react';
import { GameModeId } from '../game/types';
import { GAME_MODES } from '../game/modes';

interface GameOverModalProps {
  isWin?: boolean;
  modeId: GameModeId;
  finalStats: {
    score: number;
    level: number;
    lines: number;
    combo: number;
    timeSeconds: number;
    tetrisCount: number;
  };
  bestScore: number;
  isNewBest: boolean;
  tadkaEarned: number;
  onPlayAgain: () => void;
  onChangeMode: () => void;
  onExitToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isWin = false,
  modeId,
  finalStats,
  bestScore,
  isNewBest,
  tadkaEarned,
  onPlayAgain,
  onChangeMode,
  onExitToMenu,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slatebg-card border border-slatebg-border rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Top Header Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-dhokla-500/15 border border-dhokla-500/30 text-dhokla-golden text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{GAME_MODES[modeId].name}</span>
        </div>

        <h3 className="text-3xl font-black text-white tracking-wide">
          {isWin ? 'CHEF VICTORY!' : 'OUT OF STEAM!'}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5 mb-4">
          {isWin
            ? 'Incredible stacking skills! The dhoklas are golden and perfect.'
            : 'Too much batter overflowed! Time to wipe the board and try again.'}
        </p>

        {/* Score Card with New Best Flare */}
        <div className="w-full p-4 rounded-xl bg-slatebg-darkest/80 border border-slatebg-border/80 mb-4 flex flex-col items-center">
          {isNewBest && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-dhokla-500 text-slate-950 font-black text-[10px] uppercase tracking-wider mb-1.5 animate-bounce-subtle">
              <Trophy className="w-3 h-3 fill-slate-950" /> NEW PERSONAL BEST!
            </span>
          )}
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Final Score
          </span>
          <span className="text-3xl sm:text-4xl font-black text-dhokla-golden font-mono mt-0.5">
            {finalStats.score.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Previous Best: {bestScore.toLocaleString()} pts
          </span>
        </div>

        {/* Breakdown Grid */}
        <div className="w-full grid grid-cols-3 gap-2 mb-4">
          <div className="p-2 rounded-lg bg-slatebg-darkest/60 border border-slatebg-border/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Lines
            </span>
            <span className="text-base font-black text-curry-lime font-mono">
              {finalStats.lines}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slatebg-darkest/60 border border-slatebg-border/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Level
            </span>
            <span className="text-base font-black text-white font-mono">
              {finalStats.level}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slatebg-darkest/60 border border-slatebg-border/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Time
            </span>
            <span className="text-base font-black text-slate-200 font-mono">
              {formatTime(finalStats.timeSeconds)}
            </span>
          </div>
        </div>

        {/* Tadka Points Awarded */}
        <div className="w-full p-2.5 rounded-xl bg-saffron/15 border border-saffron/30 flex items-center justify-between px-4 mb-6">
          <div className="flex items-center gap-2 text-saffron-glow font-bold text-xs">
            <Flame className="w-4 h-4 fill-saffron" />
            <span>Tadka Points Earned</span>
          </div>
          <span className="text-base font-black text-saffron-glow font-mono">
            +{tadkaEarned} PTS
          </span>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 px-4 rounded-xl bg-dhokla-golden hover:bg-dhokla-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-dhokla-500/25 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onChangeMode}
              className="py-2.5 px-3 rounded-xl bg-slatebg-darkest hover:bg-slate-800 text-slate-200 border border-slatebg-border font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Gamepad2 className="w-4 h-4 text-dhokla-golden" />
              <span>CHANGE MODE</span>
            </button>

            <button
              onClick={onExitToMenu}
              className="py-2.5 px-3 rounded-xl bg-slatebg-darkest hover:bg-slate-800 text-slate-200 border border-slatebg-border font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
