import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { GameBoard } from './components/GameBoard';
import { NextQueue } from './components/NextQueue';
import { HoldPiece } from './components/HoldPiece';
import { StatsPanel } from './components/StatsPanel';
import { MobileControls } from './components/MobileControls';

import { HomeScreen } from './screens/HomeScreen';
import { ModeSelectScreen } from './screens/ModeSelectScreen';
import { AchievementsScreen } from './screens/AchievementsScreen';
import { StatsScreen } from './screens/StatsScreen';
import { CustomGameModal } from './screens/CustomGameModal';
import { ChallengeSelectModal } from './screens/ChallengeSelectModal';
import { PauseModal } from './screens/PauseModal';
import { GameOverModal } from './screens/GameOverModal';
import { SettingsModal } from './screens/SettingsModal';
import { ProfileModal } from './screens/ProfileModal';

import { GameEngine } from './game/engine';
import { GAME_MODES } from './game/modes';
import { audio } from './game/audio';
import { haptics } from './game/haptics';
import { persistence } from './storage/persistence';
import {
  GameModeId,
  TetrominoType,
  FloatingPopup,
  PlayerStats,
  GameSettings,
  Achievement,
  CosmeticSkin,
  BoardTheme,
  CustomSettings,
  ChallengeDef,
  DhoklaSkinId,
  BoardFrameTheme,
  SavedGameState,
  RotationState,
} from './game/types';

type ViewMode = 'home' | 'modes' | 'game' | 'achievements' | 'stats';

export const App: React.FC = () => {
  // Persistence Data
  const [stats, setStats] = useState<PlayerStats>(() => persistence.loadStats());
  const [settings, setSettings] = useState<GameSettings>(() => persistence.loadSettings());
  const [achievements, setAchievements] = useState<Achievement[]>(() => persistence.loadAchievements());
  const [skins, setSkins] = useState<CosmeticSkin[]>(() => persistence.loadSkins());
  const [themes, setThemes] = useState<BoardTheme[]>(() => persistence.loadThemes());

  // Navigation State
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [activeModeId, setActiveModeId] = useState<GameModeId>('classic');
  const [activeChallenge, setActiveChallenge] = useState<ChallengeDef | null>(null);

  // User Account & Profile State
  const [activeUsername, setActiveUsername] = useState<string | null>(() => persistence.getActiveUsername());
  const [pendingStartAction, setPendingStartAction] = useState<(() => void) | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [savedGame, setSavedGame] = useState<SavedGameState | null>(() => persistence.loadActiveGameState());
  const [startingLevel, setStartingLevel] = useState(1);

  // Helper to ensure first-time visitors sign in before playing (persists on device once logged in)
  const requireAuthThen = (action: () => void) => {
    if (!activeUsername) {
      setPendingStartAction(() => action);
      setShowProfileModal(true);
    } else {
      action();
    }
  };

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOverStats, setGameOverStats] = useState<{
    score: number;
    level: number;
    lines: number;
    combo: number;
    timeSeconds: number;
    tetrisCount: number;
    isWin?: boolean;
    tadkaEarned: number;
    isNewBest: boolean;
  } | null>(null);

  // Custom Kitchen Settings
  const [customSettings, setCustomSettings] = useState<CustomSettings>({
    startingLevel: 1,
    gravitySpeed: 'normal',
    durationSeconds: 0,
    startingGarbageRows: 0,
    previewCount: 5,
    ghostPiece: true,
    holdMechanic: true,
    musicEnabled: settings.musicEnabled,
    sfxEnabled: settings.sfxEnabled,
  });

  // Game Engine & Real-time Render State
  const engineRef = useRef<GameEngine | null>(null);
  const [heldPiece, setHeldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [nextQueue, setNextQueue] = useState<TetrominoType[]>([]);
  const [nextPieceRotation, setNextPieceRotation] = useState<RotationState>(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [combo, setCombo] = useState(-1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number | undefined>(undefined);
  const [popups, setPopups] = useState<FloatingPopup[]>([]);

  // Sync audio/haptics with settings
  useEffect(() => {
    audio.updateSettings(settings);
    haptics.setEnabled(settings.hapticEnabled);
  }, [settings]);

  // Handle Tab Visibility Change (freeze gameplay when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && currentView === 'game' && engineRef.current && !isPaused && !gameOverStats) {
        engineRef.current.setPaused(true);
        setIsPaused(true);
      }
    };
    const handleBeforeUnload = () => {
      if (engineRef.current && currentView === 'game' && !engineRef.current.isGameOver) {
        persistence.saveActiveGameState(engineRef.current.getSnapshot());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentView, isPaused, gameOverStats]);

  // Achievement unlock check helper
  const checkAchievementProgress = useCallback(
    (action: {
      type: 'game_played' | 'lines_cleared' | 'level' | 'tetris' | 'combo' | 'score' | 'sprint_time';
      value: number;
    }) => {
      setAchievements(prevAchievements => {
        let updated = false;
        const nextAchievements = prevAchievements.map(ach => {
          if (ach.unlocked) return ach;

          let newProgress = ach.progress;
          let unlockCondition = false;

          switch (ach.id) {
            case 'ach_first_game':
              if (action.type === 'game_played') {
                newProgress = 1;
                unlockCondition = true;
              }
              break;
            case 'ach_clear_10':
            case 'ach_clear_100':
            case 'ach_clear_500':
              if (action.type === 'lines_cleared') {
                newProgress = action.value;
                unlockCondition = newProgress >= ach.maxProgress;
              }
              break;
            case 'ach_reach_lvl3':
            case 'ach_reach_lvl5':
            case 'ach_reach_lvl10':
            case 'ach_reach_lvl15':
              if (action.type === 'level') {
                newProgress = Math.max(ach.progress, action.value);
                unlockCondition = newProgress >= ach.maxProgress;
              }
              break;
            case 'ach_first_tetris':
              if (action.type === 'tetris') {
                newProgress = 1;
                unlockCondition = true;
              }
              break;
            case 'ach_combo_6':
              if (action.type === 'combo') {
                newProgress = Math.max(ach.progress, action.value);
                unlockCondition = newProgress >= ach.maxProgress;
              }
              break;
            case 'ach_score_50k':
              if (action.type === 'score') {
                newProgress = Math.max(ach.progress, action.value);
                unlockCondition = newProgress >= ach.maxProgress;
              }
              break;
            case 'ach_sprint_sub120':
              if (action.type === 'sprint_time' && action.value < 120) {
                newProgress = 1;
                unlockCondition = true;
              }
              break;
          }

          if (unlockCondition && !ach.unlocked) {
            updated = true;
            audio.playAchievement();
            // Award Tadka Points
            setStats(s => {
              const updatedStats = { ...s, tadkaPoints: s.tadkaPoints + ach.tadkaReward };
              persistence.saveStats(updatedStats);
              return updatedStats;
            });
            // Show popup
            setPopups(pops => [
              ...pops,
              {
                id: `ach_${Date.now()}`,
                text: 'ACHIEVEMENT UNLOCKED!',
                subText: `${ach.title} (+${ach.tadkaReward} Tadka Pts)`,
                x: 50,
                y: 15,
                color: '#F4C430',
              },
            ]);
            return {
              ...ach,
              unlocked: true,
              unlockedAt: Date.now(),
              progress: ach.maxProgress,
            };
          }

          if (newProgress !== ach.progress) {
            updated = true;
            return { ...ach, progress: newProgress };
          }
          return ach;
        });

        if (updated) {
          persistence.saveAchievements(nextAchievements);
        }
        return nextAchievements;
      });
    },
    []
  );

  // Initialize and start a game
  const startGame = useCallback(
    (
      modeId: GameModeId,
      challenge?: ChallengeDef,
      custom?: CustomSettings,
      levelOverride?: number,
      restoreState?: SavedGameState
    ) => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }

      setActiveModeId(modeId);
      setActiveChallenge(challenge || null);
      setIsPaused(false);
      setGameOverStats(null);
      setNextPieceRotation(0);
      setCurrentView('game');

      const modeConfig = GAME_MODES[modeId];

      const engine = new GameEngine(
        modeConfig,
        {
          onScoreUpdate: (newScore, newLevel, newLines) => {
            setScore(newScore);
            setLevel(newLevel);
            setLines(newLines);
            checkAchievementProgress({ type: 'score', value: newScore });
          },
          onHoldUpdate: (newHeld, newCanHold) => {
            setHeldPiece(newHeld);
            setCanHold(newCanHold);
          },
          onQueueUpdate: newQueue => {
            setNextQueue(newQueue);
          },
          onComboUpdate: newCombo => {
            setCombo(newCombo);
            if (newCombo >= 6) {
              checkAchievementProgress({ type: 'combo', value: newCombo });
            }
          },
          onLevelUp: newLevel => {
            checkAchievementProgress({ type: 'level', value: newLevel });
          },
          onNextRotationUpdate: rot => {
            setNextPieceRotation(rot);
          },
          onFloatingPopup: popup => {
            setPopups(prev => [...prev.slice(-4), popup]);
          },
          onGameOver: final => {
            handleGameEnd(final, false);
          },
          onGameWin: final => {
            handleGameEnd(
              {
                score: final.score,
                level: 1,
                lines: final.lines,
                combo: 0,
                timeSeconds: Math.round(final.timeSeconds),
                tetrisCount: 0,
              },
              true
            );
          },
        },
        custom,
        levelOverride,
        restoreState
      );

      engineRef.current = engine;
      engine.start();

      // Track game played achievement
      if (!restoreState) {
        checkAchievementProgress({ type: 'game_played', value: 1 });
      }
    },
    [checkAchievementProgress]
  );

  // End of game handler (loss or win)
  const handleGameEnd = useCallback(
    (
      final: {
        score: number;
        level: number;
        lines: number;
        combo: number;
        timeSeconds: number;
        tetrisCount: number;
      },
      isWin: boolean
    ) => {
      // Clear saved active game on game over
      persistence.clearActiveGameState();
      setSavedGame(null);

      // Calculate Tadka Points earned: lines * 10 + score/150 + bonus
      const earnedTadka = Math.max(10, Math.round(final.lines * 10 + final.score / 150));

      setStats(prev => {
        let isNewBest = false;
        let sprintTime = prev.sprintBestTimeSeconds;

        if (activeModeId === 'classic' && final.score > prev.classicBestScore) {
          isNewBest = true;
        } else if (activeModeId === 'ultra' && final.score > prev.ultraBestScore) {
          isNewBest = true;
        } else if (activeModeId === 'rising_heat' && final.score > prev.risingHeatBestScore) {
          isNewBest = true;
        } else if (activeModeId === 'sprint' && isWin) {
          if (sprintTime === null || final.timeSeconds < sprintTime) {
            isNewBest = true;
            sprintTime = final.timeSeconds;
          }
        }

        const updatedStats: PlayerStats = {
          ...prev,
          gamesPlayed: prev.gamesPlayed + 1,
          linesCleared: prev.linesCleared + final.lines,
          highestScore: Math.max(prev.highestScore, final.score),
          highestLevel: Math.max(prev.highestLevel, final.level),
          bestCombo: Math.max(prev.bestCombo, final.combo),
          totalPlaytimeSeconds: prev.totalPlaytimeSeconds + final.timeSeconds,
          tetrisClears: prev.tetrisClears + final.tetrisCount,
          tadkaPoints: prev.tadkaPoints + earnedTadka,
          classicBestScore:
            activeModeId === 'classic'
              ? Math.max(prev.classicBestScore, final.score)
              : prev.classicBestScore,
          sprintBestTimeSeconds: sprintTime,
          ultraBestScore:
            activeModeId === 'ultra'
              ? Math.max(prev.ultraBestScore, final.score)
              : prev.ultraBestScore,
          risingHeatBestScore:
            activeModeId === 'rising_heat'
              ? Math.max(prev.risingHeatBestScore, final.score)
              : prev.risingHeatBestScore,
        };

        // Complete challenge if matched
        if (activeChallenge && !updatedStats.challengesCompleted.includes(activeChallenge.id)) {
          let challengeWon = false;
          if (activeChallenge.targetType === 'lines' && final.lines >= activeChallenge.targetValue) {
            challengeWon = true;
          } else if (
            activeChallenge.targetType === 'tetris_count' &&
            final.tetrisCount >= activeChallenge.targetValue
          ) {
            challengeWon = true;
          } else if (
            activeChallenge.targetType === 'combo' &&
            final.combo >= activeChallenge.targetValue
          ) {
            challengeWon = true;
          } else if (
            activeChallenge.targetType === 'score_time' &&
            final.score >= activeChallenge.targetValue &&
            final.timeSeconds <= 180
          ) {
            challengeWon = true;
          }

          if (challengeWon) {
            updatedStats.challengesCompleted = [
              ...updatedStats.challengesCompleted,
              activeChallenge.id,
            ];
            updatedStats.tadkaPoints += activeChallenge.tadkaReward;
            audio.playAchievement();
          }
        }

        persistence.saveStats(updatedStats);

        setGameOverStats({
          ...final,
          isWin,
          tadkaEarned: earnedTadka,
          isNewBest,
        });

        // Trigger milestone achievements
        checkAchievementProgress({
          type: 'lines_cleared',
          value: updatedStats.linesCleared,
        });
        if (final.tetrisCount > 0) {
          checkAchievementProgress({ type: 'tetris', value: 1 });
        }
        if (activeModeId === 'sprint' && isWin) {
          checkAchievementProgress({ type: 'sprint_time', value: final.timeSeconds });
        }

        return updatedStats;
      });
    },
    [activeModeId, activeChallenge, checkAchievementProgress]
  );

  // Sync timer for StatsPanel during active gameplay
  useEffect(() => {
    if (currentView !== 'game') return;

    const timerInterval = setInterval(() => {
      if (engineRef.current && !isPaused && !gameOverStats) {
        setElapsedSeconds(Math.floor(engineRef.current.elapsedSeconds));
        if (engineRef.current.timeRemainingSeconds > 0) {
          setTimeRemainingSeconds(Math.ceil(engineRef.current.timeRemainingSeconds));
        }
      }
    }, 250);

    return () => clearInterval(timerInterval);
  }, [currentView, isPaused, gameOverStats]);

  // Desktop Keyboard Handler
  useEffect(() => {
    if (currentView !== 'game' || !engineRef.current || isPaused || gameOverStats) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid browser window scroll on game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      // Discrete single-fire actions MUST ignore OS key repeat to prevent multi-fire:
      if (
        e.repeat &&
        [' ', 'ArrowUp', 'x', 'X', 'z', 'Z', 'c', 'C', 'r', 'R', 'p', 'P', 'Escape'].includes(e.key)
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          engineRef.current?.moveLeft();
          break;
        case 'ArrowRight':
          engineRef.current?.moveRight();
          break;
        case 'ArrowDown':
          engineRef.current?.softDrop();
          break;
        case 'ArrowUp':
        case 'x':
        case 'X':
          engineRef.current?.rotate(true);
          break;
        case 'z':
        case 'Z':
          engineRef.current?.rotate(false);
          break;
        case ' ':
          engineRef.current?.hardDrop();
          break;
        case 'c':
        case 'C':
          engineRef.current?.hold();
          break;
        case 'r':
        case 'R':
          engineRef.current?.rotateNextPiece(true);
          break;
        case 'p':
        case 'P':
        case 'Escape':
          engineRef.current?.setPaused(true);
          setIsPaused(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, isPaused, gameOverStats]);

  // Pause / Resume Handlers
  const handlePause = () => {
    if (engineRef.current && !isPaused && !gameOverStats) {
      engineRef.current.setPaused(true);
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (engineRef.current && isPaused) {
      engineRef.current.setPaused(false);
      setIsPaused(false);
    }
  };

  const handleRestart = () => {
    setIsPaused(false);
    setGameOverStats(null);
    startGame(activeModeId, activeChallenge || undefined, customSettings);
  };

  // Cosmetic Purchase Handlers
  const handleBuySkin = (skin: CosmeticSkin) => {
    if (stats.tadkaPoints < skin.cost) return;
    const newPoints = stats.tadkaPoints - skin.cost;
    const newStats = { ...stats, tadkaPoints: newPoints };
    const newSkins = skins.map(s => (s.id === skin.id ? { ...s, unlocked: true } : s));
    const newSettings = { ...settings, selectedSkin: skin.id };

    setStats(newStats);
    setSkins(newSkins);
    setSettings(newSettings);

    persistence.saveStats(newStats);
    persistence.saveSkins(newSkins);
    persistence.saveSettings(newSettings);
    audio.playAchievement();
  };

  const handleBuyTheme = (theme: BoardTheme) => {
    if (stats.tadkaPoints < theme.cost) return;
    const newPoints = stats.tadkaPoints - theme.cost;
    const newStats = { ...stats, tadkaPoints: newPoints };
    const newThemes = themes.map(t => (t.id === theme.id ? { ...t, unlocked: true } : t));
    const newSettings = { ...settings, selectedTheme: theme.id };

    setStats(newStats);
    setThemes(newThemes);
    setSettings(newSettings);

    persistence.saveStats(newStats);
    persistence.saveThemes(newThemes);
    persistence.saveSettings(newSettings);
    audio.playAchievement();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slatebg-darkest text-slate-100 font-game select-none">
      {/* Global Header */}
      <Header
        currentMode={currentView === 'game' ? activeModeId : undefined}
        tadkaPoints={stats.tadkaPoints}
        activeUsername={activeUsername}
        onOpenProfile={() => setShowProfileModal(true)}
        sfxEnabled={settings.sfxEnabled}
        onToggleSound={() => {
          const updated = { ...settings, sfxEnabled: !settings.sfxEnabled };
          setSettings(updated);
          persistence.saveSettings(updated);
          audio.updateSettings(updated);
        }}
        onOpenSettings={() => setShowSettingsModal(true)}
        onPause={handlePause}
        isPlaying={currentView === 'game' && !isPaused && !gameOverStats}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {currentView === 'home' && (
          <HomeScreen
            stats={stats}
            settings={settings}
            activeUsername={activeUsername}
            savedGame={savedGame}
            startingLevel={startingLevel}
            onChangeStartingLevel={lvl => setStartingLevel(lvl)}
            onResumeSavedGame={() => {
              if (savedGame) {
                requireAuthThen(() => {
                  startGame(savedGame.modeId, undefined, undefined, undefined, savedGame);
                });
              }
            }}
            onDiscardSavedGame={() => {
              persistence.clearActiveGameState();
              setSavedGame(null);
            }}
            onPlayQuick={() => requireAuthThen(() => startGame('classic', undefined, undefined, startingLevel))}
            onOpenModes={() => requireAuthThen(() => setCurrentView('modes'))}
            onOpenAchievements={() => setCurrentView('achievements')}
            onOpenStats={() => setCurrentView('stats')}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenProfile={() => setShowProfileModal(true)}
          />
        )}

        {currentView === 'modes' && (
          <ModeSelectScreen
            stats={stats}
            onSelectMode={id => requireAuthThen(() => startGame(id))}
            onOpenCustomSettings={() => requireAuthThen(() => setShowCustomModal(true))}
            onOpenChallenges={() => requireAuthThen(() => setShowChallengeModal(true))}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'achievements' && (
          <AchievementsScreen
            stats={stats}
            settings={settings}
            achievements={achievements}
            skins={skins}
            themes={themes}
            onEquipSkin={skinId => {
              const updated = { ...settings, selectedSkin: skinId };
              setSettings(updated);
              persistence.saveSettings(updated);
            }}
            onEquipTheme={themeId => {
              const updated = { ...settings, selectedTheme: themeId };
              setSettings(updated);
              persistence.saveSettings(updated);
            }}
            onBuySkin={handleBuySkin}
            onBuyTheme={handleBuyTheme}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'stats' && (
          <StatsScreen
            stats={stats}
            settings={settings}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'game' && (
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center p-2 sm:p-4">
            {/* Desktop & Tablet 3-Column Layout */}
            <div className="w-full flex flex-col md:flex-row items-center md:items-start justify-center gap-3 sm:gap-5">
              {/* Left Column (Hold piece & Desktop Stats) */}
              <div className="flex md:flex-col gap-3 w-full md:w-48 order-2 md:order-1 justify-between md:justify-start">
                <HoldPiece heldType={heldPiece} canHold={canHold} />
                <StatsPanel
                  modeId={activeModeId}
                  score={score}
                  level={level}
                  lines={lines}
                  combo={combo}
                  bestScore={stats.classicBestScore}
                  elapsedSeconds={elapsedSeconds}
                  timeRemainingSeconds={timeRemainingSeconds}
                  targetLines={GAME_MODES[activeModeId].targetLines}
                />
              </div>

              {/* Center Column (Prominent Dhokla Canvas Board) */}
              <div className="order-1 md:order-2 flex flex-col items-center">
                <GameBoard
                  engineRef={engineRef}
                  allowGhost={GAME_MODES[activeModeId].allowGhost}
                  skin={settings.selectedSkin}
                  theme={settings.selectedTheme}
                  popups={popups}
                  onRemovePopup={id => setPopups(p => p.filter(pop => pop.id !== id))}
                  gestureEnabled={settings.gestureControls || !settings.touchControls}
                  onMoveLeft={() => engineRef.current?.moveLeft()}
                  onMoveRight={() => engineRef.current?.moveRight()}
                  onRotateCW={() => engineRef.current?.rotate(true)}
                  onRotateCCW={() => engineRef.current?.rotate(false)}
                  onSoftDrop={() => engineRef.current?.softDrop()}
                  onHardDrop={() => engineRef.current?.hardDrop()}
                  onHold={() => engineRef.current?.hold()}
                />
              </div>

              {/* Right Column (Next Queue & Desktop Mode Badges) */}
              <div className="flex md:flex-col gap-3 w-full md:w-48 order-3 justify-center md:justify-start">
                <NextQueue
                  queue={nextQueue}
                  displayCount={GAME_MODES[activeModeId].previewCount}
                  nextPieceRotation={nextPieceRotation}
                  onRotateNext={() => engineRef.current?.rotateNextPiece(true)}
                />
              </div>
            </div>

            {/* Touch Controls (Available on Mobile, Tablet & Touch devices when enabled) */}
            {settings.touchControls && (
              <div className="w-full max-w-lg mx-auto mt-2 sm:mt-3">
                <MobileControls
                  onMoveLeft={() => engineRef.current?.moveLeft()}
                  onMoveRight={() => engineRef.current?.moveRight()}
                  onRotateCW={() => engineRef.current?.rotate(true)}
                  onRotateCCW={() => engineRef.current?.rotate(false)}
                  onSoftDrop={() => engineRef.current?.softDrop()}
                  onHardDrop={() => engineRef.current?.hardDrop()}
                  onHold={() => engineRef.current?.hold()}
                  onRotateNext={() => engineRef.current?.rotateNextPiece(true)}
                  canHold={canHold}
                  buttonSize={settings.buttonSize}
                  das={settings.das}
                  arr={settings.arr}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={newS => {
            setSettings(newS);
            persistence.saveSettings(newS);
          }}
          onResetProgress={() => {
            persistence.resetAllProgress();
            setStats(persistence.loadStats());
            setAchievements(persistence.loadAchievements());
            setSkins(persistence.loadSkins());
            setThemes(persistence.loadThemes());
          }}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showCustomModal && (
        <CustomGameModal
          initialSettings={customSettings}
          onStartCustomGame={newCustom => {
            setCustomSettings(newCustom);
            setShowCustomModal(false);
            startGame('custom', undefined, newCustom);
          }}
          onClose={() => setShowCustomModal(false)}
        />
      )}

      {showChallengeModal && (
        <ChallengeSelectModal
          completedChallenges={stats.challengesCompleted}
          onStartChallenge={ch => {
            setShowChallengeModal(false);
            startGame('challenge', ch);
          }}
          onClose={() => setShowChallengeModal(false)}
        />
      )}

      {isPaused && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onOpenSettings={() => setShowSettingsModal(true)}
          onExitToMenu={() => {
            if (engineRef.current && !engineRef.current.isGameOver) {
              const snap = engineRef.current.getSnapshot();
              persistence.saveActiveGameState(snap);
              setSavedGame(snap);
            }
            setIsPaused(false);
            engineRef.current?.destroy();
            setCurrentView('home');
          }}
        />
      )}

      {showProfileModal && (
        <ProfileModal
          currentUsername={activeUsername}
          stats={stats}
          isInitialAuth={!activeUsername}
          onProceedAfterAuth={() => {
            if (pendingStartAction) {
              const act = pendingStartAction;
              setPendingStartAction(null);
              act();
            }
          }}
          onProfileUpdated={newUsername => {
            setActiveUsername(newUsername);
            setStats(persistence.loadStats());
            setAchievements(persistence.loadAchievements());
            setSkins(persistence.loadSkins());
            setThemes(persistence.loadThemes());
          }}
          onClose={() => {
            setShowProfileModal(false);
            setPendingStartAction(null);
          }}
        />
      )}

      {gameOverStats && (
        <GameOverModal
          isWin={gameOverStats.isWin}
          modeId={activeModeId}
          finalStats={gameOverStats}
          bestScore={stats.classicBestScore}
          isNewBest={gameOverStats.isNewBest}
          tadkaEarned={gameOverStats.tadkaEarned}
          onPlayAgain={handleRestart}
          onChangeMode={() => {
            setGameOverStats(null);
            setCurrentView('modes');
          }}
          onExitToMenu={() => {
            setGameOverStats(null);
            setCurrentView('home');
          }}
        />
      )}
    </div>
  );
};
