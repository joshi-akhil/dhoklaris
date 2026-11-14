import { TetrominoType, RotationState, Point } from './types';

export const BOARD_COLS = 10;
export const BOARD_VISIBLE_ROWS = 20;
export const BOARD_HIDDEN_ROWS = 2;
export const BOARD_TOTAL_ROWS = BOARD_VISIBLE_ROWS + BOARD_HIDDEN_ROWS; // 22 rows

// Tetromino matrices (0 = empty, 1 = occupied)
export const TETROMINO_SHAPES: Record<TetrominoType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

// Colors/tint tags for UI styling
export const TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: '#38BDF8', // Crisp Cyan accent
  O: '#FACC15', // Golden Yellow
  T: '#C084FC', // Royal Saffron Purple
  S: '#4ADE80', // Leaf Lime Green
  Z: '#FB7185', // Spicy Chili Red
  J: '#60A5FA', // Marine Blue
  L: '#FB923C', // Warm Saffron Orange
};

// SRS Wall Kick offsets for J, L, S, T, Z
// Key is transition e.g. "0->1", "1->2", "2->3", "3->0", etc.
export const JLSTZ_WALL_KICKS: Record<string, Point[]> = {
  '0->1': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
  '1->0': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
  '1->2': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
  '2->1': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
  '2->3': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
  '3->2': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
  '3->0': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
  '0->3': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
};

// SRS Wall Kick offsets for I piece
export const I_WALL_KICKS: Record<string, Point[]> = {
  '0->1': [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: -1 }, { x: 1, y: 2 }],
  '1->0': [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 1 }, { x: -1, y: -2 }],
  '1->2': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 2 }, { x: 2, y: -1 }],
  '2->1': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: -2 }, { x: -2, y: 1 }],
  '2->3': [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 1 }, { x: -1, y: -2 }],
  '3->2': [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: -1 }, { x: 1, y: 2 }],
  '3->0': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: -2 }, { x: -2, y: 1 }],
  '0->3': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 2 }, { x: 2, y: -1 }],
};

// Gravity step interval in milliseconds per level (smooth curve)
export const GRAVITY_MS_PER_LEVEL: Record<number, number> = {
  1: 1000,
  2: 793,
  3: 618,
  4: 473,
  5: 355,
  6: 262,
  7: 190,
  8: 135,
  9: 94,
  10: 64,
  11: 43,
  12: 28,
  13: 18,
  14: 11,
  15: 7,
};

// Standard lock delay (milliseconds)
export const LOCK_DELAY_MS = 500;
export const MAX_LOCK_RESETS = 15; // Max movement resets before forced lock

// Base scoring guidelines
export const BASE_SCORES = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  SOFT_DROP_PER_CELL: 1,
  HARD_DROP_PER_CELL: 2,
  COMBO_BONUS_PER_COMBO: 50,
  BACK_TO_BACK_MULTIPLIER: 1.5,
  T_SPIN_BONUS: 400,
};

// Gujarati food-themed celebratory catchphrases
export const CELEBRATION_TITLES = [
  'FOUR-LINE FEAST!',
  'DHOKLA FRENZY!',
  'PERFECT STACK!',
  'SPICY COMBO!',
  'MASTER CHEF!',
  'TADKA EXPLOSION!',
  'UNBELIEVABLE KHAMAN!',
  'SUPER CRISPY!',
  'STREET FOOD HERO!',
];
