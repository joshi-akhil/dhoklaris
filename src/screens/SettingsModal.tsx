import React, { useState } from 'react';
import {
  X,
  Volume2,
  Music,
  Smartphone,
  Eye,
  Sliders,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { GameSettings } from '../game/types';
import { PLAYER_TITLES } from '../game/achievements';
import { audio } from '../game/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  const [localSettings, setLocalSettings] = useState<GameSettings>({ ...settings });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    audio.updateSettings(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slatebg-card border border-slatebg-border rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slatebg-border mb-4">
          <h3 className="text-lg font-black text-white tracking-wide">
            KITCHEN & GAME SETTINGS
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Audio Controls */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-dhokla-golden" />
              <span>Audio & Music</span>
            </h4>

            <div className="flex flex-col gap-3 bg-slatebg-darkest/70 p-3.5 rounded-xl border border-slatebg-border">
              {/* SFX Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Sound Effects</span>
                  <span className="text-[10px] text-slate-400">Movement, drops, and clears</span>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.sfxEnabled}
                  onChange={e => handleChange('sfxEnabled', e.target.checked)}
                  className="rounded accent-dhokla-golden w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Music Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slatebg-border/60">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Folk-Arcade Music</span>
                  <span className="text-[10px] text-slate-400">Subtle Gujarati synthesized groove</span>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.musicEnabled}
                  onChange={e => handleChange('musicEnabled', e.target.checked)}
                  className="rounded accent-dhokla-golden w-4 h-4 cursor-pointer"
                />
              </div>

              {/* SFX Volume */}
              {localSettings.sfxEnabled && (
                <div className="pt-2 border-t border-slatebg-border/60">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                    <span>SFX Volume</span>
                    <span className="font-mono text-dhokla-golden">
                      {Math.round(localSettings.soundVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={localSettings.soundVolume}
                    onChange={e => handleChange('soundVolume', parseFloat(e.target.value))}
                    className="w-full accent-dhokla-golden cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Controls & Haptics */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-curry-lime" />
              <span>Input & Mobile</span>
            </h4>

            <div className="flex flex-col gap-3 bg-slatebg-darkest/70 p-3.5 rounded-xl border border-slatebg-border">
              {/* Touch Controls Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">On-Screen Touch Buttons</span>
                  <span className="text-[10px] text-slate-400">Large buttons for mobile & tablet</span>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.touchControls}
                  onChange={e => handleChange('touchControls', e.target.checked)}
                  className="rounded accent-curry-lime w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Button Size */}
              {localSettings.touchControls && (
                <div className="flex items-center justify-between pt-2 border-t border-slatebg-border/60">
                  <span className="text-xs font-bold text-slate-200">Button Size</span>
                  <div className="flex gap-1.5">
                    {(['normal', 'large'] as const).map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleChange('buttonSize', size)}
                        className={`px-3 py-1 text-xs font-bold uppercase rounded-lg border ${
                          localSettings.buttonSize === size
                            ? 'bg-curry-light border-curry-lime text-curry-lime'
                            : 'bg-slatebg-darkest border-slatebg-border text-slate-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Gesture Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slatebg-border/60">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Swipe Gestures</span>
                  <span className="text-[10px] text-slate-400">Slide to move/soft drop, tap to rotate, flick to drop</span>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.gestureControls}
                  onChange={e => handleChange('gestureControls', e.target.checked)}
                  className="rounded accent-curry-lime w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Controls Quick Reference Card */}
              <div className="pt-2 border-t border-slatebg-border/60 text-[11px] text-slate-300">
                <span className="font-bold text-dhokla-golden block mb-1">Controls Guide:</span>
                <ul className="space-y-0.5 text-[10px] text-slate-400">
                  <li>• <b className="text-slate-200">Rotate CW:</b> [↑] or [X] | Tap board | [CW] button</li>
                  <li>• <b className="text-slate-200">Rotate CCW:</b> [Z] | Two-finger tap | [CCW] button</li>
                  <li>• <b className="text-slate-200">Pre-Rotate Next:</b> [R] | Tap Next Queue box | [NEXT] button</li>
                  <li>• <b className="text-slate-200">Move / Soft Drop:</b> [←][→][↓] | Drag finger on board</li>
                  <li>• <b className="text-slate-200">Hard Drop:</b> [Space] | Flick down | [SMASH] button</li>
                  <li>• <b className="text-slate-200">Hold Piece:</b> [C] | Flick up | [HOLD] button</li>
                </ul>
              </div>

              {/* Haptic Feedback */}
              <div className="flex items-center justify-between pt-2 border-t border-slatebg-border/60">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Haptic Vibrations</span>
                  <span className="text-[10px] text-slate-400">Feedback on drops and line clears</span>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.hapticEnabled}
                  onChange={e => handleChange('hapticEnabled', e.target.checked)}
                  className="rounded accent-curry-lime w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Accessibility & Motion */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-sky-400" />
              <span>Accessibility & Titles</span>
            </h4>

            <div className="flex flex-col gap-3 bg-slatebg-darkest/70 p-3.5 rounded-xl border border-slatebg-border">
              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Reduced Motion</span>
                  <span className="text-[10px] text-slate-400">Disables floating background animations</span>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.reducedMotion}
                  onChange={e => handleChange('reducedMotion', e.target.checked)}
                  className="rounded accent-sky-400 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Player Title Selector */}
              <div className="pt-2 border-t border-slatebg-border/60">
                <span className="text-xs font-bold text-slate-200 block mb-1.5">
                  Equipped Player Title
                </span>
                <select
                  value={localSettings.playerTitle}
                  onChange={e => handleChange('playerTitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slatebg-border rounded-lg p-2 text-xs font-bold text-dhokla-golden focus:outline-none focus:border-dhokla-500"
                >
                  {PLAYER_TITLES.map(title => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Advanced DAS / ARR Sliders */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Speedster Handling (DAS / ARR)</span>
            </h4>

            <div className="flex flex-col gap-3 bg-slatebg-darkest/70 p-3.5 rounded-xl border border-slatebg-border text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-300 mb-1">
                  <span>Delayed Auto-Shift (DAS)</span>
                  <span className="font-mono text-purple-400">{localSettings.das} ms</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="300"
                  step="10"
                  value={localSettings.das}
                  onChange={e => handleChange('das', parseInt(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slatebg-border/60">
                <div className="flex justify-between font-bold text-slate-300 mb-1">
                  <span>Auto-Repeat Rate (ARR)</span>
                  <span className="font-mono text-purple-400">{localSettings.arr} ms</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={localSettings.arr}
                  onChange={e => handleChange('arr', parseInt(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Reset Progress Section */}
          <div className="pt-2 border-t border-slatebg-border">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-red-950/20 border border-red-900/40 hover:bg-red-900/30 text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Reset All Progress & Scores</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-center flex flex-col gap-2">
                <p className="text-xs font-bold text-red-200">
                  Are you absolutely sure? This will wipe high scores and unlocked achievements.
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      onResetProgress();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-xs"
                  >
                    YES, RESET ALL
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
