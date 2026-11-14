import React, { useState } from 'react';
import {
  ArrowLeft,
  Trophy,
  Flame,
  Check,
  Lock,
  Sparkles,
  Palette,
  Shield,
  Layers,
} from 'lucide-react';
import {
  Achievement,
  CosmeticSkin,
  BoardTheme,
  DhoklaSkinId,
  BoardFrameTheme,
  PlayerStats,
  GameSettings,
} from '../game/types';
import { audio } from '../game/audio';

interface AchievementsScreenProps {
  stats: PlayerStats;
  settings: GameSettings;
  achievements: Achievement[];
  skins: CosmeticSkin[];
  themes: BoardTheme[];
  onEquipSkin: (skinId: DhoklaSkinId) => void;
  onEquipTheme: (themeId: BoardFrameTheme) => void;
  onBuySkin: (skin: CosmeticSkin) => void;
  onBuyTheme: (theme: BoardTheme) => void;
  onBack: () => void;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({
  stats,
  settings,
  achievements,
  skins,
  themes,
  onEquipSkin,
  onEquipTheme,
  onBuySkin,
  onBuyTheme,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'achievements' | 'shop'>('achievements');
  const [selectedTier, setSelectedTier] = useState<'all' | 'bronze' | 'silver' | 'gold' | 'platinum'>('all');

  const filteredAchievements = achievements.filter(
    a => selectedTier === 'all' || a.tier === selectedTier
  );

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 min-h-[calc(100vh-65px)] flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slatebg-card hover:bg-slate-800 text-slate-300 border border-slatebg-border text-xs sm:text-sm font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            THE DHOKLA MASTERS CLUB
          </h2>
          <p className="text-xs text-dhokla-golden font-medium">
            Unlock achievements, earn Tadka Points, and equip legendary cosmetics!
          </p>
        </div>

        {/* Tadka Points Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-saffron/15 border border-saffron/30 text-saffron-glow font-bold text-sm">
          <Flame className="w-4 h-4 fill-saffron" />
          <span>{stats.tadkaPoints.toLocaleString()}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slatebg-border mb-6">
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex items-center gap-2 px-5 py-2.5 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'achievements'
              ? 'border-dhokla-golden text-dhokla-golden'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Achievements ({unlockedCount}/{achievements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shop')}
          className={`flex items-center gap-2 px-5 py-2.5 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'shop'
              ? 'border-saffron text-saffron-glow'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Tadka Reward Shop</span>
        </button>
      </div>

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="flex flex-col gap-4">
          {/* Tier Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'bronze', 'silver', 'gold', 'platinum'] as const).map(t => (
              <button
                key={t}
                onClick={() => setSelectedTier(t)}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                  selectedTier === t
                    ? 'bg-dhokla-500 text-slate-950 shadow-sm'
                    : 'bg-slatebg-card text-slate-400 border border-slatebg-border hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Achievement Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
            {filteredAchievements.map(ach => (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  ach.unlocked
                    ? 'bg-slatebg-card/90 border-dhokla-500/40 shadow-md'
                    : 'bg-slatebg-card/40 border-slatebg-border/60 opacity-75'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      ach.unlocked
                        ? 'bg-dhokla-500/20 text-dhokla-golden border border-dhokla-500/50'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {ach.unlocked ? <Check className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{ach.title}</h4>
                      <span
                        className={`text-[9px] uppercase font-black px-1.5 py-0.2 rounded border ${
                          ach.tier === 'bronze'
                            ? 'bg-amber-900/30 text-amber-300 border-amber-700/50'
                            : ach.tier === 'silver'
                            ? 'bg-slate-300/20 text-slate-200 border-slate-400/50'
                            : ach.tier === 'gold'
                            ? 'bg-dhokla-500/20 text-dhokla-golden border-dhokla-500/50'
                            : 'bg-purple-900/30 text-purple-300 border-purple-500/50'
                        }`}
                      >
                        {ach.tier}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="flex items-center gap-1 text-xs font-bold text-saffron-glow">
                    <Flame className="w-3.5 h-3.5 fill-saffron" />
                    +{ach.tadkaReward}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {ach.unlocked ? 'COMPLETED' : `${ach.progress}/${ach.maxProgress}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reward Shop Tab */}
      {activeTab === 'shop' && (
        <div className="flex flex-col gap-6 pb-8">
          {/* Dhokla Skins Section */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-dhokla-golden" />
              <span>Dhokla Block Skins</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {skins.map(skin => {
                const isEquipped = settings.selectedSkin === skin.id;
                const canAfford = stats.tadkaPoints >= skin.cost;

                return (
                  <div
                    key={skin.id}
                    className={`p-4 rounded-xl border bg-slatebg-card/90 flex flex-col justify-between gap-3 ${
                      isEquipped ? 'border-dhokla-golden ring-1 ring-dhokla-golden/50' : 'border-slatebg-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-black/60 border border-slatebg-border p-1 flex items-center justify-center">
                        <img
                          src={skin.imagePath}
                          alt={skin.name}
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{skin.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{skin.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slatebg-border/60">
                      <span className="text-xs font-bold text-saffron-glow flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-saffron" />
                        {skin.unlocked ? 'Owned' : `${skin.cost} Tadka Pts`}
                      </span>

                      {skin.unlocked ? (
                        <button
                          onClick={() => {
                            onEquipSkin(skin.id);
                            audio.playMove();
                          }}
                          disabled={isEquipped}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            isEquipped
                              ? 'bg-curry-light text-curry-lime cursor-default'
                              : 'bg-slate-700 hover:bg-dhokla-500 hover:text-slate-950 text-white'
                          }`}
                        >
                          {isEquipped ? 'EQUIPPED' : 'EQUIP'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (canAfford) onBuySkin(skin);
                          }}
                          disabled={!canAfford}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            canAfford
                              ? 'bg-saffron hover:bg-saffron-glow text-slate-950 shadow-md'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          UNLOCK
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Board Themes Section */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-curry-lime" />
              <span>Board Frame Themes</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {themes.map(theme => {
                const isEquipped = settings.selectedTheme === theme.id;
                const canAfford = stats.tadkaPoints >= theme.cost;

                return (
                  <div
                    key={theme.id}
                    className={`p-4 rounded-xl border bg-slatebg-card/90 flex flex-col justify-between gap-3 ${
                      isEquipped ? 'border-curry-lime ring-1 ring-curry-lime/50' : 'border-slatebg-border'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-white">{theme.name}</h4>
                      <div className={`mt-2 h-6 rounded border ${theme.borderClass} flex items-center px-2 text-[10px] text-slate-400 font-mono`}>
                        Preview Frame
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slatebg-border/60">
                      <span className="text-xs font-bold text-saffron-glow flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-saffron" />
                        {theme.unlocked ? 'Owned' : `${theme.cost} Tadka Pts`}
                      </span>

                      {theme.unlocked ? (
                        <button
                          onClick={() => {
                            onEquipTheme(theme.id);
                            audio.playMove();
                          }}
                          disabled={isEquipped}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            isEquipped
                              ? 'bg-curry-light text-curry-lime cursor-default'
                              : 'bg-slate-700 hover:bg-dhokla-500 hover:text-slate-950 text-white'
                          }`}
                        >
                          {isEquipped ? 'EQUIPPED' : 'EQUIP'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (canAfford) onBuyTheme(theme);
                          }}
                          disabled={!canAfford}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            canAfford
                              ? 'bg-saffron hover:bg-saffron-glow text-slate-950 shadow-md'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          UNLOCK
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
