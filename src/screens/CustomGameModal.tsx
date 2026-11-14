import React, { useState } from 'react';
import { X, Play, Sliders, Check } from 'lucide-react';
import { CustomSettings } from '../game/types';

interface CustomGameModalProps {
  initialSettings: CustomSettings;
  onStartCustomGame: (settings: CustomSettings) => void;
  onClose: () => void;
}

export const CustomGameModal: React.FC<CustomGameModalProps> = ({
  initialSettings,
  onStartCustomGame,
  onClose,
}) => {
  const [settings, setSettings] = useState<CustomSettings>(initialSettings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartCustomGame(settings);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slatebg-card border border-slatebg-border rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slatebg-border mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-black text-white">CUSTOM KITCHEN SETTINGS</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Starting Level */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
              <span>Starting Level</span>
              <span className="text-dhokla-golden font-mono">Level {settings.startingLevel}</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={settings.startingLevel}
              onChange={e => setSettings({ ...settings, startingLevel: parseInt(e.target.value) })}
              className="w-full accent-dhokla-golden cursor-pointer"
            />
          </div>

          {/* Gravity Speed */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Gravity Speed
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['none', 'slow', 'normal', 'fast', 'extreme'] as const).map(speed => (
                <button
                  type="button"
                  key={speed}
                  onClick={() => setSettings({ ...settings, gravitySpeed: speed })}
                  className={`py-1.5 text-xs font-bold uppercase rounded-lg border transition-all ${
                    settings.gravitySpeed === speed
                      ? 'bg-purple-600 border-purple-400 text-white shadow-sm'
                      : 'bg-slatebg-darkest border-slatebg-border text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Time Limit
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Infinite', val: 0 },
                { label: '2 Mins', val: 120 },
                { label: '5 Mins', val: 300 },
                { label: '10 Mins', val: 600 },
              ].map(d => (
                <button
                  type="button"
                  key={d.val}
                  onClick={() => setSettings({ ...settings, durationSeconds: d.val })}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    settings.durationSeconds === d.val
                      ? 'bg-purple-600 border-purple-400 text-white shadow-sm'
                      : 'bg-slatebg-darkest border-slatebg-border text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Starting Garbage Rows */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
              <span>Starting Garbage Rows</span>
              <span className="text-red-400 font-mono">{settings.startingGarbageRows} rows</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={settings.startingGarbageRows}
              onChange={e =>
                setSettings({ ...settings, startingGarbageRows: parseInt(e.target.value) })
              }
              className="w-full accent-red-500 cursor-pointer"
            />
          </div>

          {/* Preview Pieces Count */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
              <span>Next Queue Previews</span>
              <span className="text-dhokla-golden font-mono">{settings.previewCount} pieces</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={settings.previewCount}
              onChange={e => setSettings({ ...settings, previewCount: parseInt(e.target.value) })}
              className="w-full accent-dhokla-golden cursor-pointer"
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.ghostPiece}
                onChange={e => setSettings({ ...settings, ghostPiece: e.target.checked })}
                className="rounded accent-purple-500 w-4 h-4 cursor-pointer"
              />
              <span>Ghost Piece Preview</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.holdMechanic}
                onChange={e => setSettings({ ...settings, holdMechanic: e.target.checked })}
                className="rounded accent-purple-500 w-4 h-4 cursor-pointer"
              />
              <span>Hold Mechanic</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slatebg-border mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START CUSTOM GAME</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
