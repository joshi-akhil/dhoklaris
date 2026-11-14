import {
  BOARD_COLS,
  BOARD_TOTAL_ROWS,
  JLSTZ_WALL_KICKS,
  I_WALL_KICKS,
} from './constants';
import {
  BoardMatrix,
  Tetromino,
  RotationState,
  Point,
  LineClearResult,
} from './types';

// Creates a 22x10 empty board matrix
export function createEmptyBoard(): BoardMatrix {
  return Array.from({ length: BOARD_TOTAL_ROWS }, () =>
    Array(BOARD_COLS).fill(null)
  );
}

// Rotate 2D square matrix clockwise
export function rotateMatrixCW(matrix: number[][]): number[][] {
  const n = matrix.length;
  const res: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      res[c][n - 1 - r] = matrix[r][c];
    }
  }
  return res;
}

// Rotate 2D square matrix counter-clockwise
export function rotateMatrixCCW(matrix: number[][]): number[][] {
  const n = matrix.length;
  const res: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      res[n - 1 - c][r] = matrix[r][c];
    }
  }
  return res;
}

// Checks if tetromino in position (x, y) with given matrix collides with board or walls
export function checkCollision(
  board: BoardMatrix,
  matrix: number[][],
  x: number,
  y: number
): boolean {
  const size = matrix.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] !== 0) {
        const boardX = x + c;
        const boardY = y + r;

        // Check horizontal bounds
        if (boardX < 0 || boardX >= BOARD_COLS) {
          return true;
        }

        // Check bottom bound
        if (boardY >= BOARD_TOTAL_ROWS) {
          return true;
        }

        // Check top bound (negative rows are allowed before piece drops into view)
        if (boardY < 0) {
          continue;
        }

        // Check existing locked blocks
        if (board[boardY][boardX] !== null) {
          return true;
        }
      }
    }
  }
  return false;
}

// Calculate SRS rotation with wall kicks
export function getRotatedPieceWithKicks(
  piece: Tetromino,
  board: BoardMatrix,
  clockwise: boolean
): Tetromino | null {
  const newMatrix = clockwise
    ? rotateMatrixCW(piece.matrix)
    : rotateMatrixCCW(piece.matrix);

  const oldRotation = piece.rotation;
  const newRotation = ((oldRotation + (clockwise ? 1 : 3)) % 4) as RotationState;

  // O piece doesn't need wall kicks
  if (piece.type === 'O') {
    return {
      ...piece,
      matrix: newMatrix,
      rotation: newRotation,
    };
  }

  const kickKey = `${oldRotation}->${newRotation}`;
  const kickTable = piece.type === 'I' ? I_WALL_KICKS : JLSTZ_WALL_KICKS;
  const kicks = kickTable[kickKey] || [{ x: 0, y: 0 }];

  for (const kick of kicks) {
    // Note: in SRS definitions, positive y is upwards, but in board indices, positive y is downwards
    const testX = piece.x + kick.x;
    const testY = piece.y - kick.y;

    if (!checkCollision(board, newMatrix, testX, testY)) {
      return {
        ...piece,
        matrix: newMatrix,
        x: testX,
        y: testY,
        rotation: newRotation,
      };
    }
  }

  // Rotation blocked by all kicks
  return null;
}

// Calculates ghost piece Y position
export function getGhostPieceY(
  piece: Tetromino,
  board: BoardMatrix
): number {
  let ghostY = piece.y;
  while (!checkCollision(board, piece.matrix, piece.x, ghostY + 1)) {
    ghostY++;
  }
  return ghostY;
}

// Locks active piece onto the board matrix
export function lockPieceToBoard(
  piece: Tetromino,
  board: BoardMatrix
): BoardMatrix {
  const newBoard = board.map(row => [...row]);
  const size = piece.matrix.length;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (piece.matrix[r][c] !== 0) {
        const boardY = piece.y + r;
        const boardX = piece.x + c;
        if (boardY >= 0 && boardY < BOARD_TOTAL_ROWS && boardX >= 0 && boardX < BOARD_COLS) {
          newBoard[boardY][boardX] = piece.type;
        }
      }
    }
  }

  return newBoard;
}

// Scans board, clears completed rows, shifts rows downwards, and returns result
export function clearCompletedLines(board: BoardMatrix): {
  newBoard: BoardMatrix;
  clearedRows: number[];
} {
  const clearedRows: number[] = [];
  const remainingRows: BoardMatrix = [];

  for (let r = 0; r < BOARD_TOTAL_ROWS; r++) {
    const isFull = board[r].every(cell => cell !== null);
    if (isFull) {
      clearedRows.push(r);
    } else {
      remainingRows.push([...board[r]]);
    }
  }

  if (clearedRows.length === 0) {
    return { newBoard: board, clearedRows: [] };
  }

  // Prepend empty rows at top for each cleared row
  const emptyRows = Array.from({ length: clearedRows.length }, () =>
    Array(BOARD_COLS).fill(null)
  );

  const newBoard = [...emptyRows, ...remainingRows];
  return { newBoard, clearedRows };
}

// 3-Corner T-Spin detection (SRS standard)
export function checkTSpin(
  piece: Tetromino,
  board: BoardMatrix,
  lastMoveWasRotate: boolean
): boolean {
  if (piece.type !== 'T' || !lastMoveWasRotate) {
    return false;
  }

  // T-piece center is at (piece.x + 1, piece.y + 1)
  const cx = piece.x + 1;
  const cy = piece.y + 1;

  const corners = [
    { x: cx - 1, y: cy - 1 }, // Top-Left
    { x: cx + 1, y: cy - 1 }, // Top-Right
    { x: cx - 1, y: cy + 1 }, // Bottom-Left
    { x: cx + 1, y: cy + 1 }, // Bottom-Right
  ];

  let occupiedCorners = 0;
  for (const corner of corners) {
    // If out of bounds or filled, count as occupied
    if (
      corner.x < 0 ||
      corner.x >= BOARD_COLS ||
      corner.y >= BOARD_TOTAL_ROWS ||
      (corner.y >= 0 && board[corner.y][corner.x] !== null)
    ) {
      occupiedCorners++;
    }
  }

  return occupiedCorners >= 3;
}

// Adds garbage rows at the bottom (for custom games)
export function addGarbageRows(board: BoardMatrix, count: number): BoardMatrix {
  if (count <= 0) return board;

  const newBoard = board.slice(count).map(row => [...row]);
  for (let i = 0; i < count; i++) {
    const holeIndex = Math.floor(Math.random() * BOARD_COLS);
    const garbageRow = Array(BOARD_COLS)
      .fill(null)
      .map((_, col) => (col === holeIndex ? null : 'O'));
    newBoard.push(garbageRow);
  }
  return newBoard;
}
