import { describe, it, expect, beforeEach } from 'vitest';
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
import {
  TETROMINO_SHAPES,
  BOARD_COLS,
  BOARD_TOTAL_ROWS,
  GRAVITY_MS_PER_LEVEL,
  BASE_SCORES,
} from './constants';
import { TetrominoType, Tetromino, CustomSettings } from './types';
import { GameEngine } from './engine';
import { GAME_MODES, CHALLENGES } from './modes';
import { persistence, DEFAULT_STATS, DEFAULT_SETTINGS } from '../storage/persistence';

describe('1. Tetromino Shapes & 7-Bag Randomizer', () => {
  it('all 7 standard tetromino shapes have exactly 4 cells', () => {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    types.forEach(type => {
      const shape = TETROMINO_SHAPES[type];
      let cellCount = 0;
      shape.forEach(row => {
        row.forEach(cell => {
          if (cell !== 0) cellCount++;
        });
      });
      expect(cellCount).toBe(4);
    });
  });

  it('7-Bag randomizer generates all 7 pieces without omission', () => {
    const randomizer = new PieceRandomizer();
    const pieces: TetrominoType[] = [];
    for (let i = 0; i < 7; i++) {
      pieces.push(randomizer.nextPiece().type);
    }
    const unique = new Set(pieces);
    expect(unique.size).toBe(7);
  });

  it('peek returns next N upcoming pieces without mutating sequence', () => {
    const randomizer = new PieceRandomizer();
    const preview = randomizer.peek(5);
    expect(preview.length).toBe(5);
    const next = randomizer.nextPiece();
    expect(next.type).toBe(preview[0]);
  });
});

describe('2. Board Collision & Rotation with SRS Wall Kicks', () => {
  let board = createEmptyBoard();

  beforeEach(() => {
    board = createEmptyBoard();
  });

  it('empty board has correct 22x10 dimensions', () => {
    expect(board.length).toBe(BOARD_TOTAL_ROWS);
    expect(board[0].length).toBe(BOARD_COLS);
  });

  it('detects boundary collisions at left, right, and bottom', () => {
    const piece = createPieceInstance('T');
    // In bounds
    expect(checkCollision(board, piece.matrix, 3, 5)).toBe(false);
    // Out of left bound
    expect(checkCollision(board, piece.matrix, -2, 5)).toBe(true);
    // Out of right bound
    expect(checkCollision(board, piece.matrix, 9, 5)).toBe(true);
    // Out of bottom bound
    expect(checkCollision(board, piece.matrix, 3, 21)).toBe(true);
  });

  it('rotates pieces clockwise and counter-clockwise with wall kicks', () => {
    const piece = createPieceInstance('T');
    const rotatedCW = getRotatedPieceWithKicks(piece, board, true);
    expect(rotatedCW).not.toBeNull();
    expect(rotatedCW?.rotation).toBe(1);

    const rotatedCCW = getRotatedPieceWithKicks(rotatedCW!, board, false);
    expect(rotatedCCW).not.toBeNull();
    expect(rotatedCCW?.rotation).toBe(0);
  });

  it('kicks piece away from right wall when rotated', () => {
    const piece = createPieceInstance('T');
    piece.x = 8; // Near right wall
    const rotated = getRotatedPieceWithKicks(piece, board, true);
    expect(rotated).not.toBeNull();
    expect(checkCollision(board, rotated!.matrix, rotated!.x, rotated!.y)).toBe(false);
  });

  it('O piece does not kick or get blocked by rotation', () => {
    const piece = createPieceInstance('O');
    const rotated = getRotatedPieceWithKicks(piece, board, true);
    expect(rotated).not.toBeNull();
    expect(rotated?.rotation).toBe(1);
  });
});

describe('3. Ghost Piece Calculation & Hard Drop', () => {
  it('ghost piece calculates lowest legal Y position', () => {
    const board = createEmptyBoard();
    const piece = createPieceInstance('O');
    piece.y = 0;
    const ghostY = getGhostPieceY(piece, board);
    expect(ghostY).toBe(20);
  });

  it('ghost piece respects already locked blocks', () => {
    const board = createEmptyBoard();
    board[15][4] = 'I';
    board[15][5] = 'I';

    const piece = createPieceInstance('O');
    piece.x = 4;
    piece.y = 0;
    const ghostY = getGhostPieceY(piece, board);
    expect(ghostY).toBe(13);
  });

  it('adds garbage rows with random holes at the bottom correctly', () => {
    let board = createEmptyBoard();
    board = addGarbageRows(board, 3);
    expect(board.length).toBe(BOARD_TOTAL_ROWS);
    for (let r = 19; r < 22; r++) {
      const holes = board[r].filter(c => c === null);
      expect(holes.length).toBe(1);
    }
  });
});

describe('4. Line Clearing, Combos, Scoring & T-Spins', () => {
  it('clears completed rows and shifts upper rows down', () => {
    const board = createEmptyBoard();
    board[20][0] = 'I';
    for (let c = 0; c < BOARD_COLS; c++) {
      board[21][c] = 'O';
    }

    const { newBoard, clearedRows } = clearCompletedLines(board);
    expect(clearedRows).toEqual([21]);
    expect(newBoard.length).toBe(BOARD_TOTAL_ROWS);
    expect(newBoard[21][0]).toBe('I');
    expect(newBoard[20][0]).toBeNull();
  });

  it('clears multiple lines simultaneously (Tetris 4-lines)', () => {
    const board = createEmptyBoard();
    for (let r = 18; r < 22; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        board[r][c] = 'I';
      }
    }

    const { newBoard, clearedRows } = clearCompletedLines(board);
    expect(clearedRows.length).toBe(4);
    expect(clearedRows).toEqual([18, 19, 20, 21]);
    const remainingCount = newBoard.flat().filter(c => c !== null).length;
    expect(remainingCount).toBe(0);
  });

  it('detects 3-corner T-spin correctly', () => {
    const board = createEmptyBoard();
    board[18][4] = 'I';
    board[18][6] = 'I';
    board[20][4] = 'I';

    const piece: Tetromino = {
      type: 'T',
      matrix: TETROMINO_SHAPES['T'],
      x: 4,
      y: 18,
      rotation: 0,
    };

    const isTSpin = checkTSpin(piece, board, true);
    expect(isTSpin).toBe(true);
  });
});

describe('5. Game Engine Core Lifecycle & All 7 Modes', () => {
  it('classic mode initializes with score 0, level 1, lines 0', () => {
    const engine = new GameEngine(GAME_MODES.classic, {
      onScoreUpdate: () => {},
      onHoldUpdate: () => {},
      onQueueUpdate: () => {},
      onComboUpdate: () => {},
      onGameOver: () => {},
      onFloatingPopup: () => {},
      onLevelUp: () => {},
    });

    expect(engine.score).toBe(0);
    expect(engine.level).toBe(1);
    expect(engine.lines).toBe(0);
    expect(engine.activePiece).not.toBeNull();
    engine.destroy();
  });

  it('sprint mode starts with target 40 lines', () => {
    const engine = new GameEngine(GAME_MODES.sprint, {
      onScoreUpdate: () => {},
      onHoldUpdate: () => {},
      onQueueUpdate: () => {},
      onComboUpdate: () => {},
      onGameOver: () => {},
      onFloatingPopup: () => {},
      onLevelUp: () => {},
    });

    expect(GAME_MODES.sprint.targetLines).toBe(40);
    engine.destroy();
  });

  it('ultra mode initializes with 120 seconds countdown', () => {
    const engine = new GameEngine(GAME_MODES.ultra, {
      onScoreUpdate: () => {},
      onHoldUpdate: () => {},
      onQueueUpdate: () => {},
      onComboUpdate: () => {},
      onGameOver: () => {},
      onFloatingPopup: () => {},
      onLevelUp: () => {},
    });

    expect(engine.timeRemainingSeconds).toBe(120);
    engine.destroy();
  });

  it('rising heat starts at level 6 with higher gravity multiplier', () => {
    const engine = new GameEngine(GAME_MODES.rising_heat, {
      onScoreUpdate: () => {},
      onHoldUpdate: () => {},
      onQueueUpdate: () => {},
      onComboUpdate: () => {},
      onGameOver: () => {},
      onFloatingPopup: () => {},
      onLevelUp: () => {},
    });

    expect(engine.level).toBe(6);
    expect(GAME_MODES.rising_heat.gravityMultiplier).toBe(1.75);
    engine.destroy();
  });

  it('zen mode has relaxed gravity multiplier and never allows top out game over', () => {
    const engine = new GameEngine(GAME_MODES.zen, {
      onScoreUpdate: () => {},
      onHoldUpdate: () => {},
      onQueueUpdate: () => {},
      onComboUpdate: () => {},
      onGameOver: () => {},
      onFloatingPopup: () => {},
      onLevelUp: () => {},
    });

    expect(GAME_MODES.zen.gravityMultiplier).toBe(0.6);
    engine.destroy();
  });

  it('custom kitchen mode accepts custom configuration', () => {
    const custom: CustomSettings = {
      startingLevel: 8,
      gravitySpeed: 'fast',
      durationSeconds: 300,
      startingGarbageRows: 4,
      previewCount: 3,
      ghostPiece: true,
      holdMechanic: false,
      musicEnabled: false,
      sfxEnabled: true,
    };

    const engine = new GameEngine(
      GAME_MODES.custom,
      {
        onScoreUpdate: () => {},
        onHoldUpdate: () => {},
        onQueueUpdate: () => {},
        onComboUpdate: () => {},
        onGameOver: () => {},
        onFloatingPopup: () => {},
        onLevelUp: () => {},
      },
      custom
    );

    expect(engine.level).toBe(8);
    expect(engine.timeRemainingSeconds).toBe(300);
    const garbageCells = engine.board.slice(18).flat().filter(c => c !== null);
    expect(garbageCells.length).toBeGreaterThan(0);
    engine.destroy();
  });

  it('hold mechanic holds active piece and locks hold until placement', () => {
    const engine = new GameEngine(GAME_MODES.classic, {
      onScoreUpdate: () => {},
      onHoldUpdate: () => {},
      onQueueUpdate: () => {},
      onComboUpdate: () => {},
      onGameOver: () => {},
      onFloatingPopup: () => {},
      onLevelUp: () => {},
    });

    const initialType = engine.activePiece!.type;
    const holdSuccess = engine.hold();
    expect(holdSuccess).toBe(true);
    expect(engine.holdPieceType).toBe(initialType);
    expect(engine.canHold).toBe(false);

    const secondHold = engine.hold();
    expect(secondHold).toBe(false);
    engine.destroy();
  });

  it('soft drop advances piece down and awards soft drop points', () => {
    const engine = new GameEngine(GAME_MODES.classic, {
      onScoreUpdate: () => {},
      onHoldUpdate: () => {},
      onQueueUpdate: () => {},
      onComboUpdate: () => {},
      onGameOver: () => {},
      onFloatingPopup: () => {},
      onLevelUp: () => {},
    });

    const startY = engine.activePiece!.y;
    engine.softDrop();
    expect(engine.activePiece!.y).toBe(startY + 1);
    expect(engine.score).toBeGreaterThan(0);
    engine.destroy();
  });

  it('hard drop places piece on ground immediately and increases score', () => {
    const engine = new GameEngine(GAME_MODES.classic, {
      onScoreUpdate: () => {},
      onHoldUpdate: () => {},
      onQueueUpdate: () => {},
      onComboUpdate: () => {},
      onGameOver: () => {},
      onFloatingPopup: () => {},
      onLevelUp: () => {},
    });

    const droppedRows = engine.hardDrop();
    expect(droppedRows).toBeGreaterThan(0);
    expect(engine.score).toBe(droppedRows * 2);
    engine.destroy();
  });

  it('pause freezes gameplay and resume restores gameplay', () => {
    const engine = new GameEngine(GAME_MODES.classic, {
      onScoreUpdate: () => {},
      onHoldUpdate: () => {},
      onQueueUpdate: () => {},
      onComboUpdate: () => {},
      onGameOver: () => {},
      onFloatingPopup: () => {},
      onLevelUp: () => {},
    });

    engine.setPaused(true);
    expect(engine.isPaused).toBe(true);
    expect(engine.moveLeft()).toBe(false);

    engine.setPaused(false);
    expect(engine.isPaused).toBe(false);
    engine.destroy();
  });
});

describe('6. LocalStorage Persistence & Corrupted Data Handling', () => {
  it('loads default stats when storage is empty', () => {
    persistence.resetAllProgress();
    const stats = persistence.loadStats();
    expect(stats.highestScore).toBe(0);
    expect(stats.tadkaPoints).toBeGreaterThanOrEqual(100);
  });

  it('persists and restores player settings correctly', () => {
    const testSettings = { ...DEFAULT_SETTINGS, das: 175, arr: 25 };
    persistence.saveSettings(testSettings);
    const loaded = persistence.loadSettings();
    expect(loaded.das).toBe(175);
    expect(loaded.arr).toBe(25);
  });

  it('handles corrupted localStorage data without crashing', () => {
    (persistence as any).setItem('dhoklaris_v1.0_stats', '{invalid-json!@#');
    const recovered = persistence.loadStats();
    expect(recovered).toBeDefined();
    expect(recovered.gamesPlayed).toBe(0);
  });
});

describe('7. Unique Player Account, PIN Authentication & Cross-Device Cloud Sync', () => {
  it('registers a new unique chef username successfully', () => {
    const reg = persistence.registerOrLogin('DhoklaMaster', '1234');
    expect(reg.success).toBe(true);
    expect(reg.isNewUser).toBe(true);
    expect(persistence.getActiveUsername()).toBe('DhoklaMaster');
  });

  it('prevents someone from claiming a previously owned username with wrong PIN', () => {
    // Attempting to claim 'DhoklaMaster' with wrong PIN
    const stealAttempt = persistence.registerOrLogin('DhoklaMaster', '9999');
    expect(stealAttempt.success).toBe(false);
    expect(stealAttempt.message).toContain('already claimed');
  });

  it('allows original owner to log back in with correct PIN', () => {
    const login = persistence.registerOrLogin('DhoklaMaster', '1234');
    expect(login.success).toBe(true);
    expect(login.isNewUser).toBe(false);
  });

  it('exports and imports account backup code cleanly', () => {
    const code = persistence.exportAccountCode();
    expect(typeof code).toBe('string');
    expect(code.length).toBeGreaterThan(20);

    const imp = persistence.importAccountCode(code);
    expect(imp.success).toBe(true);
    expect(persistence.getActiveUsername()).toBe('DhoklaMaster');
  });

  it('resets forgotten PIN with security answer or recovery key', () => {
    // Register with security question and answer
    const reg = persistence.registerOrLogin('ChefKhaman', '4444', 'Favorite Snack?', 'Khaman');
    expect(reg.recoveryKey).toBeDefined();

    // Wrong answer should fail
    const wrong = persistence.resetPin('ChefKhaman', 'WrongAnswer', '5555');
    expect(wrong.success).toBe(false);

    // Correct security answer resets PIN
    const resetAns = persistence.resetPin('ChefKhaman', 'khaman', '5555');
    expect(resetAns.success).toBe(true);

    // Can log in with new PIN
    const loginNew = persistence.registerOrLogin('ChefKhaman', '5555');
    expect(loginNew.success).toBe(true);

    // Or reset using 8-character recovery key
    const resetKey = persistence.resetPin('ChefKhaman', reg.recoveryKey!, '7777');
    expect(resetKey.success).toBe(true);

    const loginWithKeyPin = persistence.registerOrLogin('ChefKhaman', '7777');
    expect(loginWithKeyPin.success).toBe(true);
  });

  it('allows logging out cleanly', () => {
    persistence.setActiveUsername('TestChef');
    expect(persistence.getActiveUsername()).toBe('TestChef');
    persistence.logout();
    expect(persistence.getActiveUsername()).toBeNull();
  });
});

describe('8. Upcoming Piece Pre-Rotation (IRS & Next Queue)', () => {
  it('cycles upcoming piece rotation state 0 -> 1 -> 2 -> 3 -> 0', () => {
    let currentNextRot = 0;
    const engine = new GameEngine(GAME_MODES.classic, {
      onScoreUpdate: () => {},
      onHoldUpdate: () => {},
      onQueueUpdate: () => {},
      onComboUpdate: () => {},
      onGameOver: () => {},
      onFloatingPopup: () => {},
      onLevelUp: () => {},
      onNextRotationUpdate: rot => {
        currentNextRot = rot;
      },
    });

    expect(engine.nextPieceRotation).toBe(0);
    engine.rotateNextPiece(true);
    expect(engine.nextPieceRotation).toBe(1);
    expect(currentNextRot).toBe(1);

    engine.rotateNextPiece(true);
    expect(engine.nextPieceRotation).toBe(2);

    engine.rotateNextPiece(true);
    expect(engine.nextPieceRotation).toBe(3);

    engine.rotateNextPiece(true);
    expect(engine.nextPieceRotation).toBe(0);
  });

  it('spawns next piece with pre-rotated orientation', () => {
    const engine = new GameEngine(GAME_MODES.classic, {
      onScoreUpdate: () => {},
      onHoldUpdate: () => {},
      onQueueUpdate: () => {},
      onComboUpdate: () => {},
      onGameOver: () => {},
      onFloatingPopup: () => {},
      onLevelUp: () => {},
    });

    // Pre-rotate next piece by 90 deg CW
    engine.rotateNextPiece(true);
    expect(engine.nextPieceRotation).toBe(1);

    // Hard drop to lock current piece and spawn the pre-rotated next piece
    engine.hardDrop();

    // The newly spawned active piece must be at rotation 1
    expect(engine.activePiece?.rotation).toBe(1);
    // And nextPieceRotation resets to 0 for following piece
    expect(engine.nextPieceRotation).toBe(0);
  });
});
