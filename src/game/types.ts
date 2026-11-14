export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type RotationState = 0 | 1 | 2 | 3; // 0=North, 1=East, 2=South, 3=West

export interface Point {
  x: number;
  y: number;
}

export interface Tetromino {
  type: TetrominoType;
  matrix: number[][]; // 2D array representation
  x: number;          // Board column (0 to 9)
  y: number;          // Board row (0 to 21, including spawn area)
  rotation: RotationState;
}

export type CellValue = TetrominoType | null;

export type BoardMatrix = CellValue[][]; // 22 rows x 10 cols (rows 0-1 are hidden spawn rows)

export type GameModeId = 'classic' | 'sprint' | 'ultra' | 'zen' | 'challenge' | 'rising_heat' | 'custom';

export interface GameModeConfig {
  id: GameModeId;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  difficulty: 'Relaxed' | 'Normal' | 'Challenging' | 'Expert' | 'Custom';
  startingLevel: number;
  targetLines?: number;       // For sprint (e.g. 40)
  timeLimitSeconds?: number;  // For ultra (e.g. 120)
  hasGravity: boolean;
  gravityMultiplier: number;
  allowHold: boolean;
  allowGhost: boolean;
  previewCount: number;
  startingGarbageRows?: number;
}

export interface CustomSettings {
  startingLevel: number;
  gravitySpeed: 'slow' | 'normal' | 'fast' | 'extreme' | 'none';
  durationSeconds: number; // 0 for unlimited, 120, 300, 600
  startingGarbageRows: number;
  previewCount: number;
  ghostPiece: boolean;
  holdMechanic: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

export interface ChallengeDef {
  id: string;
  title: string;
  description: string;
  difficulty: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  tadkaReward: number;
  targetType: 'lines' | 'consecutive_clears' | 'tetris_count' | 'score_time' | 'no_hard_drop' | 'combo';
  targetValue: number;
  extraCondition?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  tadkaReward: number;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
  iconName: string;
}

export type DhoklaSkinId = 'classic' | 'khaman' | 'spicy' | 'golden';

export interface CosmeticSkin {
  id: DhoklaSkinId;
  name: string;
  description: string;
  imagePath: string;
  cost: number;
  unlocked: boolean;
}

export type BoardFrameTheme = 'charcoal' | 'brass_thali' | 'curry_leaf' | 'saffron_festival';

export interface BoardTheme {
  id: BoardFrameTheme;
  name: string;
  borderClass: string;
  glowClass: string;
  cost: number;
  unlocked: boolean;
}

export interface PlayerStats {
  gamesPlayed: number;
  linesCleared: number;
  highestScore: number;
  highestLevel: number;
  bestCombo: number;
  totalPlaytimeSeconds: number;
  tetrisClears: number;
  tadkaPoints: number;
  classicBestScore: number;
  sprintBestTimeSeconds: number | null;
  ultraBestScore: number;
  risingHeatBestScore: number;
  challengesCompleted: string[];
}

export interface GameSettings {
  soundVolume: number;
  musicVolume: number;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  hapticEnabled: boolean;
  reducedMotion: boolean;
  touchControls: boolean;
  gestureControls: boolean;
  buttonSize: 'normal' | 'large';
  selectedSkin: DhoklaSkinId;
  selectedTheme: BoardFrameTheme;
  playerTitle: string;
  das: number; // Delayed Auto Shift (ms, default 150)
  arr: number; // Auto Repeat Rate (ms, default 30)
}

export interface LineClearResult {
  linesCleared: number;
  clearedRows: number[];
  isTetris: boolean;
  isTSpin: boolean;
  comboCount: number;
  backToBack: boolean;
  scoreAwarded: number;
  celebrationMessage?: string;
}

export interface SavedGameState {
  modeId: GameModeId;
  board: BoardMatrix;
  activePiece: Tetromino | null;
  holdPieceType: TetrominoType | null;
  canHold: boolean;
  score: number;
  level: number;
  lines: number;
  combo: number;
  elapsedSeconds: number;
  timeRemainingSeconds?: number;
  savedAt: number;
}

export interface UserProfile {
  uid: string;
  username: string;
  pinHash: string;
  recoveryQuestion?: string;
  recoveryAnswerHash?: string;
  recoveryKey?: string;
  createdAt: number;
  lastActiveAt: number;
}

export interface FloatingPopup {
  id: string;
  text: string;
  subText?: string;
  x: number;
  y: number;
  color?: string;
}
