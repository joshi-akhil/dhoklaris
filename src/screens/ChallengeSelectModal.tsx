import React from 'react';
import { X, Play, Award, Check, Flame } from 'lucide-react';
import { ChallengeDef } from '../game/types';
import { CHALLENGES } from '../game/modes';

interface ChallengeSelectModalProps {
  completedChallenges: string[];
  onStartChallenge: (challenge: ChallengeDef) => void;
  onClose: () => void;
}

export const ChallengeSelectModal: React.FC<ChallengeSelectModalProps> = ({
  completedChallenges,
  onStartChallenge,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slatebg-card border border-slatebg-border rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slatebg-border mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-white">CHALLENGE TRIALS</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Challenge list */}
        <div className="flex flex-col gap-3 overflow-y-auto pr-1">
          {CHALLENGES.map(ch => {
            const isCompleted = completedChallenges.includes(ch.id);

            return (
              <div
                key={ch.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-slatebg-card/90 border-curry-light/60'
                    : 'bg-slatebg-darkest/70 border-slatebg-border hover:border-dhokla-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white">{ch.title}</h4>
                    <span
                      className={`text-[9px] uppercase font-black px-1.5 py-0.2 rounded border ${
                        ch.difficulty === 'Bronze'
                          ? 'bg-amber-900/30 text-amber-300 border-amber-700/50'
                          : ch.difficulty === 'Silver'
                          ? 'bg-slate-300/20 text-slate-200 border-slate-400/50'
                          : ch.difficulty === 'Gold'
                          ? 'bg-dhokla-500/20 text-dhokla-golden border-dhokla-500/50'
                          : 'bg-purple-900/30 text-purple-300 border-purple-500/50'
                      }`}
                    >
                      {ch.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{ch.description}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="flex items-center gap-1 text-xs font-bold text-saffron-glow">
                    <Flame className="w-3.5 h-3.5 fill-saffron" />
                    +{ch.tadkaReward}
                  </span>

                  {isCompleted ? (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-curry-leaf/50 text-curry-lime text-xs font-bold border border-curry-light">
                      <Check className="w-3.5 h-3.5" />
                      DONE
                    </span>
                  ) : (
                    <button
                      onClick={() => onStartChallenge(ch)}
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>START</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
