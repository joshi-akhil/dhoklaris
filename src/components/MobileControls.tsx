import React, { useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  RotateCw,
  RotateCcw,
  Zap,
  Repeat,
} from 'lucide-react';

interface MobileControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onHold: () => void;
  onRotateNext?: () => void;
  canHold: boolean;
  buttonSize?: 'normal' | 'large';
  das?: number; // Delayed Auto Shift
  arr?: number; // Auto Repeat Rate
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onRotateCW,
  onRotateCCW,
  onSoftDrop,
  onHardDrop,
  onHold,
  onRotateNext,
  canHold,
  buttonSize = 'normal',
  das = 260,
  arr = 50,
}) => {
  const repeatTimer = useRef<number | null>(null);
  const dasTimer = useRef<number | null>(null);
  const lastTouchTime = useRef<number>(0);

  // Stop active hold repeat
  const stopHoldAction = () => {
    if (dasTimer.current !== null) {
      clearTimeout(dasTimer.current);
      dasTimer.current = null;
    }
    if (repeatTimer.current !== null) {
      clearInterval(repeatTimer.current);
      repeatTimer.current = null;
    }
  };

  // Start repeatable directional action (Left, Right, Down)
  // Ensures single tap executes EXACTLY ONCE; repeat only starts if held for >= 260ms
  const startHoldAction = (action: () => void) => {
    stopHoldAction();
    action(); // Immediate 1st action

    const effectiveDas = Math.max(260, das);
    const effectiveArr = Math.max(45, arr);

    dasTimer.current = window.setTimeout(() => {
      repeatTimer.current = window.setInterval(action, effectiveArr);
    }, effectiveDas);
  };

  // Touch handler for repeatable movement buttons
  const handleRepeatTouchStart = (action: () => void) => (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    lastTouchTime.current = Date.now();
    startHoldAction(action);
  };

  // Mouse handler for repeatable movement buttons (ignores synthetic mouse events from touch)
  const handleRepeatMouseDown = (action: () => void) => (e: React.MouseEvent) => {
    if (Date.now() - lastTouchTime.current < 600) return;
    startHoldAction(action);
  };

  // Touch handler for single discrete buttons (Rotate, Hold, Smash, Next)
  const handleSingleTouch = (action: () => void) => (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    lastTouchTime.current = Date.now();
    action();
  };

  // Mouse handler for single discrete buttons (ignores synthetic clicks from touch)
  const handleSingleClick = (action: () => void) => (e: React.MouseEvent) => {
    if (Date.now() - lastTouchTime.current < 600) return;
    action();
  };

  const isLarge = buttonSize === 'large';
  const btnPad = isLarge ? 'p-3.5 sm:p-4' : 'p-2.5 sm:p-3';
  const iconSize = isLarge ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-2 p-2 select-none touch-none">
      {/* Top action row: Hold, Rotate CCW, Rotate CW, Pre-Rotate Next */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Hold Button */}
        <button
          type="button"
          onTouchStart={handleSingleTouch(onHold)}
          onClick={handleSingleClick(onHold)}
          disabled={!canHold}
          aria-label="Hold Piece"
          className={`${btnPad} flex-1 flex items-center justify-center gap-1.5 rounded-xl border font-bold text-xs shadow-md transition-all touch-btn active:scale-95 ${
            canHold
              ? 'bg-curry-leaf/60 border-curry-light/80 text-curry-lime active:bg-curry-light'
              : 'bg-slatebg-card/40 border-slatebg-border/40 text-slate-500 opacity-50'
          }`}
        >
          <Repeat className={iconSize} />
          <span>HOLD</span>
        </button>

        {/* Rotate CCW */}
        <button
          type="button"
          onTouchStart={handleSingleTouch(onRotateCCW)}
          onClick={handleSingleClick(onRotateCCW)}
          aria-label="Rotate Counter Clockwise"
          title="Rotate active piece counter-clockwise (Left)"
          className={`${btnPad} flex items-center justify-center rounded-xl bg-slatebg-card border border-slatebg-border text-slate-200 active:bg-dhokla-500/20 active:text-dhokla-golden active:border-dhokla-500/50 shadow-md touch-btn active:scale-95`}
        >
          <RotateCcw className={iconSize} />
        </button>

        {/* Rotate CW (Primary Action) */}
        <button
          type="button"
          onTouchStart={handleSingleTouch(onRotateCW)}
          onClick={handleSingleClick(onRotateCW)}
          aria-label="Rotate Clockwise"
          title="Rotate active piece clockwise (Right)"
          className={`${btnPad} flex-[1.1] flex items-center justify-center gap-1.5 rounded-xl bg-dhokla-500/25 border border-dhokla-500/60 text-dhokla-golden active:bg-dhokla-500/40 font-bold text-xs shadow-md touch-btn active:scale-95`}
        >
          <RotateCw className={iconSize} />
          <span>CW</span>
        </button>

        {/* Pre-Rotate Next Shape */}
        {onRotateNext && (
          <button
            type="button"
            onTouchStart={handleSingleTouch(onRotateNext)}
            onClick={handleSingleClick(onRotateNext)}
            aria-label="Pre-Rotate Next Shape"
            title="Pre-rotate the upcoming shape in Next Queue"
            className={`${btnPad} flex-[0.9] flex items-center justify-center gap-1 rounded-xl bg-sky-500/20 border border-sky-400/50 text-sky-300 active:bg-sky-500/40 font-bold text-xs shadow-md touch-btn active:scale-95`}
          >
            <RotateCw className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[10px]">NEXT</span>
          </button>
        )}
      </div>

      {/* Bottom directional & drop row */}
      <div className="grid grid-cols-4 gap-2 px-1">
        {/* Move Left */}
        <button
          type="button"
          onTouchStart={handleRepeatTouchStart(onMoveLeft)}
          onTouchEnd={stopHoldAction}
          onTouchCancel={stopHoldAction}
          onMouseDown={handleRepeatMouseDown(onMoveLeft)}
          onMouseUp={stopHoldAction}
          onMouseLeave={stopHoldAction}
          aria-label="Move Left"
          className={`${btnPad} flex items-center justify-center rounded-xl bg-slatebg-card border border-slatebg-border text-slate-100 active:bg-slate-700 shadow-md touch-btn active:scale-95`}
        >
          <ArrowLeft className={iconSize} />
        </button>

        {/* Move Right */}
        <button
          type="button"
          onTouchStart={handleRepeatTouchStart(onMoveRight)}
          onTouchEnd={stopHoldAction}
          onTouchCancel={stopHoldAction}
          onMouseDown={handleRepeatMouseDown(onMoveRight)}
          onMouseUp={stopHoldAction}
          onMouseLeave={stopHoldAction}
          aria-label="Move Right"
          className={`${btnPad} flex items-center justify-center rounded-xl bg-slatebg-card border border-slatebg-border text-slate-100 active:bg-slate-700 shadow-md touch-btn active:scale-95`}
        >
          <ArrowRight className={iconSize} />
        </button>

        {/* Soft Drop */}
        <button
          type="button"
          onTouchStart={handleRepeatTouchStart(onSoftDrop)}
          onTouchEnd={stopHoldAction}
          onTouchCancel={stopHoldAction}
          onMouseDown={handleRepeatMouseDown(onSoftDrop)}
          onMouseUp={stopHoldAction}
          onMouseLeave={stopHoldAction}
          aria-label="Soft Drop"
          className={`${btnPad} flex items-center justify-center rounded-xl bg-slatebg-card border border-slatebg-border text-slate-100 active:bg-slate-700 shadow-md touch-btn active:scale-95`}
        >
          <ArrowDown className={iconSize} />
        </button>

        {/* Hard Drop (Instant Smash) */}
        <button
          type="button"
          onTouchStart={handleSingleTouch(onHardDrop)}
          onClick={handleSingleClick(onHardDrop)}
          aria-label="Hard Drop"
          className={`${btnPad} flex items-center justify-center gap-1 rounded-xl bg-saffron/25 border border-saffron/60 text-saffron-glow active:bg-saffron/40 font-black text-xs shadow-md touch-btn active:scale-95`}
        >
          <Zap className={iconSize} />
          <span className="text-[10px]">SMASH</span>
        </button>
      </div>
    </div>
  );
};
