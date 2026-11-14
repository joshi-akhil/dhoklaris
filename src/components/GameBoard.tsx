import React, { useRef, useEffect } from 'react';
import { DhoklaSkinId, BoardFrameTheme, FloatingPopup } from '../game/types';
import { DhoklaRenderer } from '../game/renderer';
import { getGhostPieceY, createEmptyBoard } from '../game/board';
import { GameEngine } from '../game/engine';

interface GameBoardProps {
  engineRef: React.RefObject<GameEngine | null>;
  allowGhost?: boolean;
  skin: DhoklaSkinId;
  theme: BoardFrameTheme;
  popups: FloatingPopup[];
  onRemovePopup: (id: string) => void;
  gestureEnabled?: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onHold?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  engineRef,
  allowGhost = true,
  skin,
  theme,
  popups,
  onRemovePopup,
  gestureEnabled = true,
  onMoveLeft,
  onMoveRight,
  onRotateCW,
  onRotateCCW,
  onSoftDrop,
  onHardDrop,
  onHold,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<DhoklaRenderer | null>(null);
  const emptyBoardRef = useRef(createEmptyBoard());
  const lastClearingRef = useRef<number[]>([]);

  // Fluid Touch Gestures Tracking State
  const touchState = useRef<{
    startX: number;
    startY: number;
    lastColX: number;
    lastRowY: number;
    startTime: number;
    totalMovement: number;
    isMultiTouch: boolean;
  } | null>(null);

  // Setup renderer and high-performance 60 FPS animation render loop
  useEffect(() => {
    if (!canvasRef.current) return;
    if (!rendererRef.current) {
      rendererRef.current = new DhoklaRenderer(canvasRef.current);
    }

    let animId: number;

    const renderLoop = () => {
      const engine = engineRef.current;
      const renderer = rendererRef.current;

      if (renderer) {
        if (engine) {
          // Trigger particle explosion and camera shake on line clears
          if (
            engine.clearingRows.length > 0 &&
            lastClearingRef.current !== engine.clearingRows
          ) {
            lastClearingRef.current = engine.clearingRows;
            const cellSize = Math.floor(canvasRef.current!.width / 10);
            renderer.spawnLineClearParticles(engine.clearingRows, cellSize);
            renderer.triggerShake(engine.clearingRows.length === 4 ? 12 : 6);
          } else if (engine.clearingRows.length === 0) {
            lastClearingRef.current = [];
          }

          const ghostY =
            allowGhost && engine.activePiece
              ? getGhostPieceY(engine.activePiece, engine.board)
              : null;

          renderer.render(
            engine.board,
            engine.activePiece,
            ghostY,
            skin,
            engine.clearingRows,
            engine.clearAnimationProgress
          );
        } else {
          renderer.render(
            emptyBoardRef.current,
            null,
            null,
            skin,
            [],
            0
          );
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [engineRef, allowGhost, skin]);

  // Touch Gestures handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!gestureEnabled) return;

    // Two-finger tap immediately triggers Counter-Clockwise (CCW) rotation!
    if (e.touches.length >= 2) {
      if (touchState.current) touchState.current.isMultiTouch = true;
      onRotateCCW();
      return;
    }

    const t = e.touches[0];
    touchState.current = {
      startX: t.clientX,
      startY: t.clientY,
      lastColX: t.clientX,
      lastRowY: t.clientY,
      startTime: Date.now(),
      totalMovement: 0,
      isMultiTouch: false,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!gestureEnabled || !touchState.current || touchState.current.isMultiTouch) return;
    const t = e.touches[0];
    const dxFromLast = t.clientX - touchState.current.lastColX;
    const dyFromLast = t.clientY - touchState.current.lastRowY;

    // Responsive column & row drag step threshold (1:1 with canvas grid cells)
    const colStep = 30;
    const rowStep = 30;

    // Horizontal drag tracking: smoothly slides piece left or right in real time
    if (Math.abs(dxFromLast) >= colStep) {
      const steps = Math.floor(Math.abs(dxFromLast) / colStep);
      for (let i = 0; i < steps; i++) {
        if (dxFromLast > 0) {
          onMoveRight();
        } else {
          onMoveLeft();
        }
      }
      touchState.current.lastColX += (dxFromLast > 0 ? 1 : -1) * steps * colStep;
      touchState.current.totalMovement += Math.abs(dxFromLast);
    }

    // Downward drag tracking: triggers soft drop row-by-row
    if (dyFromLast >= rowStep) {
      const steps = Math.floor(dyFromLast / rowStep);
      for (let i = 0; i < steps; i++) {
        onSoftDrop();
      }
      touchState.current.lastRowY += steps * rowStep;
      touchState.current.totalMovement += dyFromLast;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!gestureEnabled || !touchState.current) return;
    if (touchState.current.isMultiTouch) {
      touchState.current = null;
      return;
    }

    const t = e.changedTouches[0];
    const duration = Date.now() - touchState.current.startTime;
    const totalDx = t.clientX - touchState.current.startX;
    const totalDy = t.clientY - touchState.current.startY;
    const absDx = Math.abs(totalDx);
    const absDy = Math.abs(totalDy);

    if (touchState.current.totalMovement < 14 && duration < 300) {
      // Tap on board -> Rotate Clockwise (CW)
      onRotateCW();
    } else if (totalDy > 55 && duration < 260 && absDx < totalDy * 0.75) {
      // Fast flick downwards -> Hard Drop (Smash)
      onHardDrop();
    } else if (totalDy < -50 && duration < 300 && absDx < -totalDy * 0.75) {
      // Fast flick upwards -> Hold Piece
      onHold?.();
    }

    touchState.current = null;
  };

  const handleTouchCancel = () => {
    touchState.current = null;
  };

  // Get theme frame classes
  const getThemeClass = (t: BoardFrameTheme) => {
    switch (t) {
      case 'brass_thali':
        return 'border-dhokla-500/80 shadow-2xl shadow-dhokla-500/25 bg-[#17130A] ring-2 ring-dhokla-600/30';
      case 'curry_leaf':
        return 'border-curry-light/80 shadow-2xl shadow-curry-lime/25 bg-[#0C1711] ring-2 ring-curry-light/40';
      case 'saffron_festival':
        return 'border-saffron/80 shadow-2xl shadow-saffron/30 bg-[#1C0E05] ring-2 ring-saffron/40';
      default:
        return 'border-slate-800 shadow-2xl shadow-black/80 bg-slatebg-darkest ring-1 ring-slate-700/40';
    }
  };

  return (
    <div className="relative flex items-center justify-center p-1 sm:p-2 select-none touch-none">
      {/* Board Outer Container */}
      <div
        className={`relative rounded-2xl overflow-hidden border-4 p-1 sm:p-1.5 transition-all duration-300 select-none touch-none ${getThemeClass(
          theme
        )}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        {/* Playfield Canvas (10:20 ratio, standard 300x600 px) */}
        <canvas
          ref={canvasRef}
          width={300}
          height={600}
          className="w-[240px] h-[480px] xs:w-[270px] xs:h-[540px] sm:w-[300px] sm:h-[600px] block rounded-lg bg-black/70 cursor-pointer touch-none select-none"
        />

        {/* Floating notifications layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col items-center justify-center">
          {popups.map(p => (
            <div
              key={p.id}
              onAnimationEnd={() => onRemovePopup(p.id)}
              className="animate-float-up flex flex-col items-center justify-center drop-shadow-lg"
            >
              <span
                className="text-2xl sm:text-3xl font-black font-mono tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
                style={{ color: p.color || '#F4C430' }}
              >
                {p.text}
              </span>
              {p.subText && (
                <span className="text-xs sm:text-sm font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-black/80 border border-white/20 text-white tracking-widest mt-1">
                  {p.subText}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
