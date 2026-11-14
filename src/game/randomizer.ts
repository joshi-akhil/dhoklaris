import { TetrominoType, Tetromino, RotationState } from './types';
import { TETROMINO_SHAPES, BOARD_COLS } from './constants';
import { rotateMatrixCW } from './board';

const ALL_PIECES: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

export class PieceRandomizer {
  private bag: TetrominoType[] = [];
  private queue: TetrominoType[] = [];

  constructor() {
    this.refillQueue();
  }

  // Generates and shuffles a fresh 7-bag using Fisher-Yates algorithm
  private generateBag(): TetrominoType[] {
    const bag = [...ALL_PIECES];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
  }

  // Ensure queue has at least 7 pieces
  private refillQueue() {
    while (this.queue.length < 14) {
      if (this.bag.length === 0) {
        this.bag = this.generateBag();
      }
      this.queue.push(this.bag.pop()!);
    }
  }

  // Peeks at next N upcoming pieces
  public peek(count: number = 5): TetrominoType[] {
    this.refillQueue();
    return this.queue.slice(0, count);
  }

  // Retrieves the next piece from the queue with optional initial pre-rotation
  public nextPiece(initialRotation: RotationState = 0): Tetromino {
    this.refillQueue();
    const type = this.queue.shift()!;
    return createPieceInstance(type, initialRotation);
  }

  // Reset the generator state
  public reset() {
    this.bag = [];
    this.queue = [];
    this.refillQueue();
  }
}

// Spawns a piece at the top center of the board with optional initial pre-rotation
export function createPieceInstance(type: TetrominoType, initialRotation: RotationState = 0): Tetromino {
  let matrix = TETROMINO_SHAPES[type].map(row => [...row]);
  for (let i = 0; i < initialRotation; i++) {
    matrix = rotateMatrixCW(matrix);
  }
  const size = matrix.length;

  // Center horizontally
  const x = Math.floor((BOARD_COLS - size) / 2);
  // Spawn visibly in the top visible rows (I piece has line on row 1, so y=1 puts it on row 2; other pieces have blocks on row 0, so y=2 puts them on row 2)
  const y = type === 'I' ? 1 : 2;

  return {
    type,
    matrix,
    x,
    y,
    rotation: initialRotation,
  };
}
