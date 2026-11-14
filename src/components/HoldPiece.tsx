import React from 'react';
import { TetrominoType, RotationState } from '../game/types';
import { TETROMINO_SHAPES } from '../game/constants';
import { rotateMatrixCW } from '../game/board';
import { getAssetUrl } from '../utils/assets';

interface PiecePreviewProps {
  type: TetrominoType | null;
  size?: 'sm' | 'md';
  active?: boolean;
  rotation?: RotationState;
}

export const MiniDhoklaPiece: React.FC<PiecePreviewProps> = ({
  type,
  size = 'md',
  active = true,
  rotation = 0,
}) => {
  if (!type) {
    return (
      <div className="w-16 h-12 flex items-center justify-center text-slate-600 text-xs font-mono">
        EMPTY
      </div>
    );
  }

  let matrix = TETROMINO_SHAPES[type];
  if (rotation > 0) {
    let rotated = matrix.map(row => [...row]);
    for (let i = 0; i < rotation; i++) {
      rotated = rotateMatrixCW(rotated);
    }
    matrix = rotated;
  }
  const cellSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6';

  return (
    <div
      className={`flex flex-col items-center justify-center p-1 transition-opacity ${
        active ? 'opacity-100' : 'opacity-40'
      }`}
    >
      {matrix.map((row, rIdx) => {
        // Skip completely empty rows in 4x4 matrix for cleaner preview
        const hasBlock = row.some(cell => cell !== 0);
        if (!hasBlock && (rIdx === 0 || rIdx === 3)) return null;

        return (
          <div key={rIdx} className="flex">
            {row.map((cell, cIdx) => (
              <div
                key={cIdx}
                className={`${cellSize} flex items-center justify-center p-[0.5px]`}
              >
                {cell !== 0 ? (
                  <img
                    src={getAssetUrl('assets/dhokla/dhokla-block-small.png')}
                    alt="Dhokla Cell"
                    className="w-full h-full object-contain filter drop-shadow-sm select-none pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

interface HoldPieceProps {
  heldType: TetrominoType | null;
  canHold: boolean;
}

export const HoldPiece: React.FC<HoldPieceProps> = ({ heldType, canHold }) => {
  return (
    <div className="bg-slatebg-card/90 border border-slatebg-border rounded-xl p-2.5 sm:p-3 flex flex-col items-center shadow-md">
      <div className="flex items-center justify-between w-full mb-1">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-dhokla-300">
          Hold
        </span>
        <span
          className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
            canHold
              ? 'bg-curry-light/40 text-curry-lime'
              : 'bg-red-950/40 text-red-400'
          }`}
        >
          {canHold ? 'READY' : 'LOCKED'}
        </span>
      </div>

      <div className="w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center bg-slatebg-darkest/60 rounded-lg border border-slatebg-border/60">
        <MiniDhoklaPiece type={heldType} active={canHold} />
      </div>
      <span className="text-[9px] text-slate-400 mt-1">Press [C] or Hold Btn</span>
    </div>
  );
};
