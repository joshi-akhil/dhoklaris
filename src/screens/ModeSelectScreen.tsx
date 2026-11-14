import React from 'react';
import {
  ArrowLeft,
  Play,
  Flame,
  Timer,
  Shield,
  Sliders,
  Award,
  Sparkles,
} from 'lucide-react';
import { GameModeId, PlayerStats } from '../game/types';
import { GAME_MODES } from '../game/modes';

interface ModeSelectScreenProps {
  stats: PlayerStats;
  onSelectMode: (modeId: GameModeId) => void;
  onOpenCustomSettings: () => void;
  onOpenChallenges: () => void;
  onBack: () => void;
}

export const ModeSelectScreen: React.FC<ModeSelectScreenProps> = ({
  stats,
  onSelectMode,
  onOpenCustomSettings,
  onOpenChallenges,
  onBack,
}) => {
  const getModeIcon = (id: GameModeId) => {
    switch (id) {
      case 'classic':
        return <Sparkles className="w-5 h-5 text-dhokla-golden" />;
      case 'sprint':
        return <Timer className="w-5 h-5 text-curry-lime" />;
      case 'ultra':
        return <Flame className="w-5 h-5 text-saffron" />;
      case 'zen':
        return <Shield className="w-5 h-5 text-sky-400" />;
      case 'challenge':
        return <Award className="w-5 h-5 text-amber-400" />;
      case 'rising_heat':
        return <Flame className="w-5 h-5 text-red-500 fill-red-500" />;
      case 'custom':
        return <Sliders className="w-5 h-5 text-purple-400" />;
    }
  };

  const getPersonalBest = (id: GameModeId) => {
    switch (id) {
      case 'classic':
        return `Best: ${stats.classicBestScore.toLocaleString()} pts`;
      case 'sprint':
        return stats.sprintBestTimeSeconds
          ? `Best: ${stats.sprintBestTimeSeconds}s`
          : 'No record yet';
      case 'ultra':
        return `Best: ${stats.ultraBestScore.toLocaleString()} pts`;
      case 'rising_heat':
        return `Best: ${stats.risingHeatBestScore.toLocaleString()} pts`;
      case 'challenge':
        return `${stats.challengesCompleted.length} Completed`;
      case 'zen':
        return 'Endless Peace';
      case 'custom':
        return 'Sandbox';
    }
  };

  const handleCardClick = (id: GameModeId) => {
    if (id === 'custom') {
      onOpenCustomSettings();
    } else if (id === 'challenge') {
      onOpenChallenges();
    } else {
      onSelectMode(id);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 min-h-[calc(100vh-65px)] flex flex-col">
      {/* Navigation Top */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slatebg-card hover:bg-slate-800 text-slate-300 border border-slatebg-border text-xs sm:text-sm font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </button>
        <h2 className="text-xl sm:text-2xl font-black text-dhokla-100 tracking-wide">
          SELECT GAME MODE
        </h2>
        <div className="w-20" /> {/* Spacer */}
      </div>

      {/* Grid of Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
        {(Object.keys(GAME_MODES) as GameModeId[]).map(id => {
          const mode = GAME_MODES[id];
          const isClassic = id === 'classic';

          return (
            <div
              key={id}
              onClick={() => handleCardClick(id)}
              className={`relative group rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer flex flex-col justify-between shadow-lg ${
                isClassic
                  ? 'bg-gradient-to-br from-slatebg-card via-slatebg-card to-dhokla-900/30 border-dhokla-500/50 hover:border-dhokla-400'
                  : 'bg-slatebg-card/90 hover:bg-slatebg-card border-slatebg-border hover:border-slate-600'
              }`}
            >
              <div>
                {/* Header row with Icon, Badge, Difficulty */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slatebg-darkest/70 border border-slatebg-border/60">
                      {getModeIcon(id)}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-dhokla-golden transition-colors">
                        {mode.name}
                      </h3>
                      <p className="text-[11px] font-medium text-slate-400">
                        {mode.tagline}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${
                      mode.difficulty === 'Relaxed'
                        ? 'bg-sky-950/40 border-sky-600 text-sky-400'
                        : mode.difficulty === 'Normal'
                        ? 'bg-dhokla-950/40 border-dhokla-600 text-dhokla-golden'
                        : mode.difficulty === 'Expert'
                        ? 'bg-red-950/40 border-red-600 text-red-400'
                        : 'bg-saffron/20 border-saffron/60 text-saffron-glow'
                    }`}
                  >
                    {mode.difficulty}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-300 mt-2 line-clamp-2">
                  {mode.description}
                </p>
              </div>

              {/* Bottom Info & Play Button */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slatebg-border/60">
                <span className="text-xs font-mono font-bold text-dhokla-200/80">
                  {getPersonalBest(id)}
                </span>

                <button
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-xs transition-all ${
                    isClassic
                      ? 'bg-dhokla-golden hover:bg-dhokla-400 text-slate-950 shadow-md shadow-dhokla-500/20'
                      : 'bg-slate-700/70 group-hover:bg-dhokla-500 group-hover:text-slate-950 text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{id === 'custom' ? 'CUSTOMIZE' : id === 'challenge' ? 'VIEW' : 'PLAY'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
