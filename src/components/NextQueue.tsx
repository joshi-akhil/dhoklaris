import React from 'react';
import { RotateCw } from 'lucide-react';
import { TetrominoType, RotationState } from '../game/types';
import { MiniDhoklaPiece } from './HoldPiece';

interface NextQueueProps {
  queue: TetrominoType[];
  displayCount?: number;
  nextPieceRotation?: RotationState;
  onRotateNext?: () => void;
}

export const NextQueue: React.FC<NextQueueProps> = ({
  queue,
  displayCount = 5,
  nextPieceRotation = 0,
  onRotateNext,
}) => {
  const visiblePieces = queue.slice(0, displayCount);

  return (
    <div className="bg-slatebg-card/90 border border-slatebg-border rounded-xl p-2.5 sm:p-3 flex flex-col items-center shadow-md">
      <div className="flex items-center justify-between w-full mb-1">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-dhokla-300">
          Next Queue
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-dhokla-500/10 text-dhokla-golden font-bold">
          {visiblePieces.length} PIECES
        </span>
      </div>

      <div className="flex flex-col gap-1.5 sm:gap-2 w-full items-center">
        {/* Next Primary Piece - Interactive Pre-Rotation target */}
        {visiblePieces.length > 0 && (
          <div className="flex flex-col items-center w-full">
            <button
              type="button"
              onClick={onRotateNext}
              title="Click or tap to pre-rotate incoming shape before it spawns (Shortcut: R)"
              className="relative w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center bg-slatebg-darkest/80 hover:bg-slatebg-darkest active:scale-95 rounded-lg border border-dhokla-500/40 hover:border-dhokla-500/70 shadow-inner transition-all group cursor-pointer"
            >
              <MiniDhoklaPiece
                type={visiblePieces[0]}
                size="md"
                rotation={nextPieceRotation}
              />
              {/* Rotation Badge overlay */}
              <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1 py-0.2 rounded bg-black/70 border border-dhokla-500/40 text-[8px] font-mono font-bold text-dhokla-golden group-hover:border-dhokla-400">
                <RotateCw className="w-2.5 h-2.5" />
                <span>{nextPieceRotation * 90}°</span>
              </div>
            </button>

            {/* Quick pre-rotate action pill */}
            <button
              type="button"
              onClick={onRotateNext}
              className="mt-1 flex items-center gap-1 text-[9px] font-bold text-dhokla-golden hover:text-dhokla-300 active:text-white transition-colors bg-dhokla-500/10 hover:bg-dhokla-500/20 px-2 py-0.5 rounded-full border border-dhokla-500/20"
            >
              <RotateCw className="w-2.5 h-2.5" />
              <span>Rotate Next [R]</span>
            </button>
          </div>
        )}

        {/* Subsequent 2-4 upcoming pieces */}
        <div className="flex sm:flex-col gap-1 sm:gap-1.5 items-center justify-center w-full mt-1">
          {visiblePieces.slice(1, displayCount).map((type, idx) => (
            <div
              key={idx}
              className="w-12 h-10 sm:w-16 sm:h-12 flex items-center justify-center bg-slatebg-darkest/40 rounded border border-slatebg-border/50"
            >
              <MiniDhoklaPiece type={type} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
