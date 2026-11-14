import React from 'react';
import { Play, RotateCcw, Home, Settings } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onExitToMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenSettings,
  onExitToMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slatebg-card border border-slatebg-border rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Dhokla icon */}
        <div className="w-14 h-14 rounded-2xl bg-black/50 border border-dhokla-500/40 p-2 mb-3 flex items-center justify-center shadow-lg">
          <img
            src={getAssetUrl('assets/dhokla/dhokla-block.png')}
            alt="Dhokla"
            className="w-10 h-10 object-contain"
          />
        </div>

        <h3 className="text-2xl font-black text-white tracking-wider mb-1">
          KITCHEN PAUSED
        </h3>
        <p className="text-xs text-dhokla-200/80 mb-6">
          Steamer is on hold. Take a breath!
        </p>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl bg-dhokla-golden hover:bg-dhokla-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-dhokla-500/20 transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>RESUME COOKING</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl bg-slatebg-darkest hover:bg-slate-800 text-slate-200 border border-slatebg-border font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART GAME</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 px-4 rounded-xl bg-slatebg-darkest hover:bg-slate-800 text-slate-200 border border-slatebg-border font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>SETTINGS</span>
          </button>

          <button
            onClick={onExitToMenu}
            className="w-full py-2.5 px-4 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-900/50 font-bold text-xs flex items-center justify-center gap-2 transition-all mt-2"
          >
            <Home className="w-4 h-4" />
            <span>QUIT TO MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
