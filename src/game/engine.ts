import {
  BoardMatrix,
  Tetromino,
  TetrominoType,
  GameModeConfig,
  LineClearResult,
  FloatingPopup,
  CustomSettings,
  SavedGameState,
  RotationState,
} from './types';
import {
  BOARD_COLS,
  BOARD_TOTAL_ROWS,
  GRAVITY_MS_PER_LEVEL,
  LOCK_DELAY_MS,
  MAX_LOCK_RESETS,
  BASE_SCORES,
  CELEBRATION_TITLES,
} from './constants';
import {
  createEmptyBoard,
  checkCollision,
  getRotatedPieceWithKicks,
  getGhostPieceY,
  lockPieceToBoard,
  clearCompletedLines,
  checkTSpin,
  addGarbageRows,
} from './board';
import { PieceRandomizer, createPieceInstance } from './randomizer';
import { audio } from './audio';
import { haptics } from './haptics';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number, level: number, lines: number) => void;
  onHoldUpdate: (hold: TetrominoType | null, canHold: boolean) => void;
  onQueueUpdate: (queue: TetrominoType[]) => void;
  onComboUpdate: (combo: number) => void;
  onGameOver: (finalStats: {
    score: number;
    level: number;
    lines: number;
    combo: number;
    timeSeconds: number;
    tetrisCount: number;
  }) => void;
  onGameWin?: (finalStats: {
    score: number;
    timeSeconds: number;
    lines: number;
  }) => void;
  onFloatingPopup: (popup: FloatingPopup) => void;
  onLevelUp: (newLevel: number) => void;
  onNextRotationUpdate?: (rotation: RotationState) => void;
}

export class GameEngine {
  // Board & Pieces
  public board: BoardMatrix = createEmptyBoard();
  public activePiece: Tetromino | null = null;
  public holdPieceType: TetrominoType | null = null;
  public canHold = true;
  public nextPieceRotation: RotationState = 0;
  private randomizer = new PieceRandomizer();

  // Mode & Configuration
  private mode: GameModeConfig;
  private customSettings?: CustomSettings;
  private callbacks: GameEngineCallbacks;

  // State
  public score = 0;
  public level = 1;
  public lines = 0;
  public combo = -1;
  public backToBack = false;
  public tetrisCount = 0;
  public isPaused = false;
  public isGameOver = false;
  public isGameWon = false;
  public elapsedSeconds = 0;
  public timeRemainingSeconds = 0;

  // Timing & Gravity
  private lastFrameTime = 0;
  private gravityAccumulator = 0;
  private lockTimer = 0;
  private lockResets = 0;
  private isTouchingGround = false;
  private animFrameId: number | null = null;
  private lastMoveWasRotate = false;

  // Line Clear Animation State
  public clearingRows: number[] = [];
  public clearAnimationProgress = 0;
  private isClearingAnimation = false;

  constructor(
    mode: GameModeConfig,
    callbacks: GameEngineCallbacks,
    customSettings?: CustomSettings,
    startingLevelOverride?: number,
    savedState?: SavedGameState
  ) {
    this.mode = mode;
    this.callbacks = callbacks;
    this.customSettings = customSettings;
    if (savedState) {
      this.restoreFromState(savedState);
    } else {
      this.init(startingLevelOverride);
    }
  }

  public init(startingLevelOverride?: number) {
    this.board = createEmptyBoard();
    this.randomizer.reset();
    this.score = 0;
    this.lines = 0;
    this.combo = -1;
    this.backToBack = false;
    this.tetrisCount = 0;
    this.isPaused = false;
    this.isGameOver = false;
    this.isGameWon = false;
    this.elapsedSeconds = 0;
    this.holdPieceType = null;
    this.canHold = this.mode.allowHold;
    this.clearingRows = [];
    this.isClearingAnimation = false;

    // Apply mode initial configuration
    this.level = startingLevelOverride || this.mode.startingLevel;
    if (this.mode.id === 'custom' && this.customSettings) {
      this.level = this.customSettings.startingLevel;
      if (this.customSettings.startingGarbageRows > 0) {
        this.board = addGarbageRows(this.board, this.customSettings.startingGarbageRows);
      }
      this.timeRemainingSeconds = this.customSettings.durationSeconds;
    } else if (this.mode.timeLimitSeconds) {
      this.timeRemainingSeconds = this.mode.timeLimitSeconds;
    }

    // Spawn first piece
    this.spawnNextPiece();
    this.callbacks.onScoreUpdate(this.score, this.level, this.lines);
    this.callbacks.onHoldUpdate(this.holdPieceType, this.canHold);
    this.callbacks.onQueueUpdate(this.randomizer.peek(this.mode.previewCount));
  }

  public restoreFromState(state: SavedGameState) {
    this.board = state.board;
    this.activePiece = state.activePiece;
    this.holdPieceType = state.holdPieceType;
    this.canHold = state.canHold;
    this.score = state.score;
    this.level = state.level;
    this.lines = state.lines;
    this.combo = state.combo;
    this.elapsedSeconds = state.elapsedSeconds;
    this.timeRemainingSeconds = state.timeRemainingSeconds || 0;
    this.isPaused = false;
    this.isGameOver = false;
    this.isGameWon = false;
    this.clearingRows = [];
    this.isClearingAnimation = false;

    this.callbacks.onScoreUpdate(this.score, this.level, this.lines);
    this.callbacks.onHoldUpdate(this.holdPieceType, this.canHold);
    this.callbacks.onQueueUpdate(this.randomizer.peek(this.mode.previewCount));
    this.callbacks.onComboUpdate(this.combo);
  }

  public getSnapshot(): SavedGameState {
    return {
      modeId: this.mode.id,
      board: this.board.map(row => [...row]),
      activePiece: this.activePiece ? { ...this.activePiece, matrix: this.activePiece.matrix.map(r => [...r]) } : null,
      holdPieceType: this.holdPieceType,
      canHold: this.canHold,
      score: this.score,
      level: this.level,
      lines: this.lines,
      combo: this.combo,
      elapsedSeconds: Math.round(this.elapsedSeconds),
      timeRemainingSeconds: this.timeRemainingSeconds > 0 ? Math.round(this.timeRemainingSeconds) : undefined,
      savedAt: Date.now(),
    };
  }

  public start() {
    this.lastFrameTime = performance.now();
    this.loop(this.lastFrameTime);
  }

  public stop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    if (!paused) {
      this.lastFrameTime = performance.now();
    }
  }

  // Spawn upcoming piece
  private spawnNextPiece() {
    const piece = this.randomizer.nextPiece(this.nextPieceRotation);
    this.nextPieceRotation = 0;
    this.callbacks.onNextRotationUpdate?.(0);
    this.callbacks.onQueueUpdate(this.randomizer.peek(this.mode.previewCount));

    // Check spawn collision (Top out)
    if (checkCollision(this.board, piece.matrix, piece.x, piece.y)) {
      if (this.mode.id === 'zen') {
        // In Zen mode, top out clears the top 6 rows instead of ending the game!
        for (let r = 2; r < 8; r++) {
          this.board[r].fill(null);
        }
        audio.playLineClear(2);
      } else {
        this.triggerGameOver();
        return;
      }
    }

    this.activePiece = piece;
    this.canHold = this.mode.allowHold;
    this.callbacks.onHoldUpdate(this.holdPieceType, this.canHold);
    this.lockTimer = 0;
    this.lockResets = 0;
    this.isTouchingGround = false;
    this.lastMoveWasRotate = false;
  }

  // Main fixed update loop
  private loop = (time: number) => {
    if (this.isGameOver || this.isGameWon) {
      return;
    }

    const delta = Math.min(time - this.lastFrameTime, 100); // Guard against giant delta jumps
    this.lastFrameTime = time;

    if (!this.isPaused) {
      this.update(delta);
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(deltaMs: number) {
    // Mode Timer updates
    const deltaSec = deltaMs / 1000;
    this.elapsedSeconds += deltaSec;

    if (this.timeRemainingSeconds > 0) {
      this.timeRemainingSeconds -= deltaSec;
      if (this.timeRemainingSeconds <= 0) {
        this.timeRemainingSeconds = 0;
        this.triggerGameEndByTimer();
        return;
      }
    }

    // Line clear flash animation handling
    if (this.isClearingAnimation) {
      this.clearAnimationProgress += deltaMs / 200; // 200ms flash animation
      if (this.clearAnimationProgress >= 1) {
        this.finishLineClear();
      }
      return;
    }

    if (!this.activePiece) return;

    // Check if resting on ground
    const onGround = checkCollision(
      this.board,
      this.activePiece.matrix,
      this.activePiece.x,
      this.activePiece.y + 1
    );

    if (onGround) {
      this.isTouchingGround = true;
      this.lockTimer += deltaMs;
      if (this.lockTimer >= LOCK_DELAY_MS) {
        this.lockActivePiece();
      }
    } else {
      this.isTouchingGround = false;

      // Handle gravity drop
      if (this.mode.hasGravity) {
        let baseInterval = GRAVITY_MS_PER_LEVEL[Math.min(this.level, 15)] || 60;
        if (this.mode.id === 'custom' && this.customSettings) {
          if (this.customSettings.gravitySpeed === 'slow') baseInterval = 1200;
          if (this.customSettings.gravitySpeed === 'fast') baseInterval = 180;
          if (this.customSettings.gravitySpeed === 'extreme') baseInterval = 50;
          if (this.customSettings.gravitySpeed === 'none') baseInterval = 9999999;
        } else {
          baseInterval = baseInterval / this.mode.gravityMultiplier;
        }

        this.gravityAccumulator += deltaMs;
        if (this.gravityAccumulator >= baseInterval) {
          this.gravityAccumulator = 0;
          this.moveDown();
        }
      }
    }
  }

  // --- Player Input Actions ---

  public moveLeft(): boolean {
    if (this.isPaused || this.isGameOver || !this.activePiece || this.isClearingAnimation) return false;
    if (!checkCollision(this.board, this.activePiece.matrix, this.activePiece.x - 1, this.activePiece.y)) {
      this.activePiece.x--;
      this.lastMoveWasRotate = false;
      this.resetLockDelay();
      audio.playMove();
      return true;
    }
    return false;
  }

  public moveRight(): boolean {
    if (this.isPaused || this.isGameOver || !this.activePiece || this.isClearingAnimation) return false;
    if (!checkCollision(this.board, this.activePiece.matrix, this.activePiece.x + 1, this.activePiece.y)) {
      this.activePiece.x++;
      this.lastMoveWasRotate = false;
      this.resetLockDelay();
      audio.playMove();
      return true;
    }
    return false;
  }

  public rotate(clockwise: boolean = true): boolean {
    if (this.isPaused || this.isGameOver || !this.activePiece || this.isClearingAnimation) return false;
    const rotated = getRotatedPieceWithKicks(this.activePiece, this.board, clockwise);
    if (rotated) {
      this.activePiece = rotated;
      this.lastMoveWasRotate = true;
      this.resetLockDelay();
      audio.playRotate();
      return true;
    }
    return false;
  }

  // Pre-rotate the upcoming piece in the Next Queue before it enters the board
  public rotateNextPiece(clockwise: boolean = true): RotationState {
    if (this.isPaused || this.isGameOver) return 0;
    this.nextPieceRotation = ((this.nextPieceRotation + (clockwise ? 1 : 3)) % 4) as RotationState;
    audio.playRotate();
    haptics.trigger('light');
    const angles = ['0° (Default)', '90° CW', '180°', '270° CCW'];
    this.callbacks.onFloatingPopup({
      id: `prerot_${Date.now()}`,
      text: `NEXT: ${angles[this.nextPieceRotation]}`,
      subText: 'Pre-Rotated',
      x: 75,
      y: 18,
      color: '#38BDF8',
    });
    this.callbacks.onNextRotationUpdate?.(this.nextPieceRotation);
    return this.nextPieceRotation;
  }

  public softDrop(): boolean {
    if (this.isPaused || this.isGameOver || !this.activePiece || this.isClearingAnimation) return false;
    if (!checkCollision(this.board, this.activePiece.matrix, this.activePiece.x, this.activePiece.y + 1)) {
      this.activePiece.y++;
      this.score += BASE_SCORES.SOFT_DROP_PER_CELL;
      this.callbacks.onScoreUpdate(this.score, this.level, this.lines);
      this.lastMoveWasRotate = false;
      audio.playSoftDrop();
      return true;
    }
    return false;
  }

  public hardDrop(): number {
    if (this.isPaused || this.isGameOver || !this.activePiece || this.isClearingAnimation) return 0;
    const ghostY = getGhostPieceY(this.activePiece, this.board);
    const dropDistance = ghostY - this.activePiece.y;
    this.activePiece.y = ghostY;

    this.score += dropDistance * BASE_SCORES.HARD_DROP_PER_CELL;
    this.callbacks.onScoreUpdate(this.score, this.level, this.lines);

    audio.playHardDrop();
    haptics.trigger('medium');

    this.lockActivePiece();
    return dropDistance;
  }

  public hold(): boolean {
    if (
      this.isPaused ||
      this.isGameOver ||
      !this.activePiece ||
      !this.canHold ||
      !this.mode.allowHold ||
      this.isClearingAnimation
    ) {
      return false;
    }

    const currentType = this.activePiece.type;
    if (this.holdPieceType === null) {
      this.holdPieceType = currentType;
      this.spawnNextPiece();
    } else {
      const nextType = this.holdPieceType;
      this.holdPieceType = currentType;
      this.activePiece = createPieceInstance(nextType);
    }

    this.canHold = false;
    this.callbacks.onHoldUpdate(this.holdPieceType, this.canHold);
    audio.playMove();
    return true;
  }

  private moveDown() {
    if (!this.activePiece) return;
    if (!checkCollision(this.board, this.activePiece.matrix, this.activePiece.x, this.activePiece.y + 1)) {
      this.activePiece.y++;
      this.lastMoveWasRotate = false;
    }
  }

  private resetLockDelay() {
    if (this.isTouchingGround && this.lockResets < MAX_LOCK_RESETS) {
      this.lockTimer = 0;
      this.lockResets++;
    }
  }

  // Locks the piece into the matrix
  private lockActivePiece() {
    if (!this.activePiece) return;

    const isTSpin = checkTSpin(this.activePiece, this.board, this.lastMoveWasRotate);
    this.board = lockPieceToBoard(this.activePiece, this.board);
    audio.playLock();

    // Check completed lines
    const { clearedRows } = clearCompletedLines(this.board);
    if (clearedRows.length > 0) {
      this.clearingRows = clearedRows;
      this.isClearingAnimation = true;
      this.clearAnimationProgress = 0;
      this.handleLineClearScoring(clearedRows.length, isTSpin);
    } else {
      this.combo = -1; // Reset combo if piece placement didn't clear lines
      this.callbacks.onComboUpdate(this.combo);
      this.spawnNextPiece();
    }
  }

  // Handle score calculations and celebrations
  private handleLineClearScoring(lineCount: number, isTSpin: boolean) {
    this.combo++;
    this.callbacks.onComboUpdate(this.combo);

    let basePoints = 0;
    let isTetris = false;

    if (lineCount === 1) basePoints = BASE_SCORES.SINGLE;
    else if (lineCount === 2) basePoints = BASE_SCORES.DOUBLE;
    else if (lineCount === 3) basePoints = BASE_SCORES.TRIPLE;
    else if (lineCount === 4) {
      basePoints = BASE_SCORES.TETRIS;
      isTetris = true;
      this.tetrisCount++;
    }

    if (isTSpin) {
      basePoints += BASE_SCORES.T_SPIN_BONUS;
    }

    // Back-to-back multiplier (for consecutive Tetrises)
    let b2bMultiplier = 1.0;
    if (isTetris) {
      if (this.backToBack) {
        b2bMultiplier = BASE_SCORES.BACK_TO_BACK_MULTIPLIER;
      }
      this.backToBack = true;
    } else {
      this.backToBack = false;
    }

    // Combo points
    const comboBonus = Math.max(0, this.combo) * BASE_SCORES.COMBO_BONUS_PER_COMBO * this.level;
    const pointsAwarded = Math.round(basePoints * this.level * b2bMultiplier) + comboBonus;

    this.score += pointsAwarded;
    this.lines += lineCount;

    // Trigger Audio and Haptics
    if (isTetris) {
      audio.playTetris();
      haptics.trigger('celebration');
    } else {
      audio.playLineClear(lineCount);
      haptics.trigger(lineCount > 1 ? 'medium' : 'light');
    }

    if (this.combo > 1) {
      audio.playCombo(this.combo);
    }

    // Celebratory Floating Notification
    let celebrationTitle = '';
    if (isTetris) {
      celebrationTitle = b2bMultiplier > 1 ? 'BACK-TO-BACK FEAST!' : 'FOUR-LINE FEAST!';
    } else if (this.combo >= 4) {
      celebrationTitle = `SPICY COMBO x${this.combo}!`;
    } else if (lineCount === 3) {
      celebrationTitle = 'TRIPLE TADKA!';
    }

    if (celebrationTitle) {
      this.callbacks.onFloatingPopup({
        id: `pop_${Date.now()}`,
        text: `+${pointsAwarded.toLocaleString()}`,
        subText: celebrationTitle,
        x: 50,
        y: 40,
        color: isTetris ? '#F4C430' : '#4ADE80',
      });
    }

    // Level progression (every 10 lines in Classic)
    if (this.mode.id === 'classic' || this.mode.id === 'rising_heat') {
      const targetLevel = 1 + Math.floor(this.lines / 10);
      if (targetLevel > this.level) {
        this.level = targetLevel;
        audio.playLevelUp();
        this.callbacks.onLevelUp(this.level);
        this.callbacks.onFloatingPopup({
          id: `lvl_${Date.now()}`,
          text: `LEVEL ${this.level}!`,
          subText: 'Gravity Increased!',
          x: 50,
          y: 20,
          color: '#F4C430',
        });
      }
    }

    // Mode-specific completion checks
    if (this.mode.id === 'sprint' && this.mode.targetLines && this.lines >= this.mode.targetLines) {
      this.triggerGameWin();
      return;
    }

    this.callbacks.onScoreUpdate(this.score, this.level, this.lines);
  }

  // Completes row disappearance animation
  private finishLineClear() {
    this.isClearingAnimation = false;
    const { newBoard } = clearCompletedLines(this.board);
    this.board = newBoard;
    this.clearingRows = [];
    this.spawnNextPiece();
  }

  // Trigger Game Over
  private triggerGameOver() {
    this.isGameOver = true;
    audio.playGameOver();
    haptics.trigger('heavy');
    this.callbacks.onGameOver({
      score: this.score,
      level: this.level,
      lines: this.lines,
      combo: Math.max(0, this.combo),
      timeSeconds: Math.round(this.elapsedSeconds),
      tetrisCount: this.tetrisCount,
    });
  }

  // Trigger Win (Sprint 40 lines)
  private triggerGameWin() {
    this.isGameWon = true;
    audio.playAchievement();
    haptics.trigger('celebration');
    if (this.callbacks.onGameWin) {
      this.callbacks.onGameWin({
        score: this.score,
        timeSeconds: parseFloat(this.elapsedSeconds.toFixed(2)),
        lines: this.lines,
      });
    }
  }

  // Trigger End when Ultra timer expires
  private triggerGameEndByTimer() {
    this.isGameOver = true;
    audio.playAchievement();
    this.callbacks.onGameOver({
      score: this.score,
      level: this.level,
      lines: this.lines,
      combo: Math.max(0, this.combo),
      timeSeconds: Math.round(this.elapsedSeconds),
      tetrisCount: this.tetrisCount,
    });
  }

  // Clean-up
  public destroy() {
    this.stop();
  }
}
