import {
  BOARD_COLS,
  BOARD_VISIBLE_ROWS,
  BOARD_HIDDEN_ROWS,
  BOARD_TOTAL_ROWS,
} from './constants';
import {
  BoardMatrix,
  Tetromino,
  DhoklaSkinId,
} from './types';
import { getAssetUrl } from '../utils/assets';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  vRot: number;
  isMustardSeed?: boolean;
}

export class DhoklaRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreenSprite: HTMLCanvasElement | null = null;
  private offscreenGhostSprite: HTMLCanvasElement | null = null;
  private cachedCellSize = 0;
  private cachedSkin: DhoklaSkinId = 'classic';

  // Loaded skin image elements
  private loadedImages: Map<string, HTMLImageElement> = new Map();
  private particles: Particle[] = [];
  private screenShake = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true })!;
    this.preloadSkins();
  }

  // Preloads the dhokla image assets into memory
  private preloadSkins() {
    const skinPaths: Record<DhoklaSkinId, string> = {
      classic: getAssetUrl('assets/dhokla/dhokla-block.png'),
      khaman: getAssetUrl('assets/dhokla/dhokla-khaman.png'),
      spicy: getAssetUrl('assets/dhokla/dhokla-spicy.png'),
      golden: getAssetUrl('assets/dhokla/dhokla-golden.png'),
    };

    Object.entries(skinPaths).forEach(([skinId, path]) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        this.loadedImages.set(skinId, img);
        this.invalidateSpriteCache();
      };
    });
  }

  public invalidateSpriteCache() {
    this.offscreenSprite = null;
    this.offscreenGhostSprite = null;
    this.cachedCellSize = 0;
  }

  // Updates offscreen canvas sprite cache for high-FPS performance
  private ensureSpriteCache(cellSize: number, skin: DhoklaSkinId) {
    if (
      this.offscreenSprite &&
      this.offscreenGhostSprite &&
      this.cachedCellSize === cellSize &&
      this.cachedSkin === skin
    ) {
      return;
    }

    this.cachedCellSize = cellSize;
    this.cachedSkin = skin;

    // Build main block sprite
    this.offscreenSprite = document.createElement('canvas');
    this.offscreenSprite.width = cellSize;
    this.offscreenSprite.height = cellSize;
    const sCtx = this.offscreenSprite.getContext('2d')!;

    const img = this.loadedImages.get(skin) || this.loadedImages.get('classic');
    const padding = Math.max(1, Math.round(cellSize * 0.05));
    const renderSize = cellSize - padding * 2;

    if (img && img.complete && img.naturalWidth > 0) {
      // Draw loaded realistic Dhokla cube
      sCtx.drawImage(img, padding, padding, renderSize, renderSize);
    } else {
      // Procedural authentic dhokla fallback
      this.drawProceduralDhokla(sCtx, padding, padding, renderSize, skin, 1);
    }

    // Build translucent Ghost block sprite
    this.offscreenGhostSprite = document.createElement('canvas');
    this.offscreenGhostSprite.width = cellSize;
    this.offscreenGhostSprite.height = cellSize;
    const gCtx = this.offscreenGhostSprite.getContext('2d')!;

    gCtx.globalAlpha = 0.32;
    if (img && img.complete && img.naturalWidth > 0) {
      gCtx.drawImage(img, padding, padding, renderSize, renderSize);
    } else {
      this.drawProceduralDhokla(gCtx, padding, padding, renderSize, skin, 0.35);
    }
    // Subtle golden neon border on ghost
    gCtx.globalAlpha = 0.75;
    gCtx.strokeStyle = '#F4C430';
    gCtx.lineWidth = 1.5;
    gCtx.strokeRect(padding + 0.5, padding + 0.5, renderSize - 1, renderSize - 1);
  }

  // Procedural Dhokla generator (sponge texture + mustard seeds + coriander leaves)
  private drawProceduralDhokla(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    skin: DhoklaSkinId,
    alpha: number
  ) {
    ctx.save();
    ctx.globalAlpha = alpha;

    // Base yellow gradients
    let baseColor1 = '#FDD835';
    let baseColor2 = '#F57F17';
    if (skin === 'khaman') {
      baseColor1 = '#FFCA28';
      baseColor2 = '#FF8F00';
    } else if (skin === 'spicy') {
      baseColor1 = '#DCE775';
      baseColor2 = '#9E9D24';
    } else if (skin === 'golden') {
      baseColor1 = '#FFEE58';
      baseColor2 = '#F57F17';
    }

    const grad = ctx.createLinearGradient(x, y, x + size, y + size);
    grad.addColorStop(0, baseColor1);
    grad.addColorStop(1, baseColor2);

    // Rounded rectangle cube
    const r = Math.max(3, Math.round(size * 0.12));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, r);
    ctx.fill();

    // Sponge pores
    ctx.fillStyle = 'rgba(180, 100, 0, 0.22)';
    const seed = (x * 7 + y * 13) % 100;
    for (let i = 0; i < 6; i++) {
      const px = x + ((seed * (i + 1) * 17) % (size - 8)) + 4;
      const py = y + ((seed * (i + 1) * 31) % (size - 8)) + 4;
      const pr = 1 + ((i * 3) % 2.5);
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Black mustard seeds (Rai)
    ctx.fillStyle = '#111111';
    for (let i = 0; i < 3; i++) {
      const mx = x + ((seed * (i + 3) * 23) % (size - 10)) + 5;
      const my = y + ((seed * (i + 3) * 41) % (size - 10)) + 5;
      ctx.beginPath();
      ctx.arc(mx, my, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Green coriander garnish fleck
    ctx.fillStyle = '#2E7D32';
    const gx = x + size * 0.55;
    const gy = y + size * 0.35;
    ctx.beginPath();
    ctx.ellipse(gx, gy, 3, 2, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Border bevel
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  }

  // Trigger camera screen shake
  public triggerShake(amount: number = 7) {
    this.screenShake = amount;
  }

  // Spawns dhokla crumb and mustard seed explosion on line clear
  public spawnLineClearParticles(clearedRows: number[], cellSize: number) {
    clearedRows.forEach(row => {
      const displayRow = row - BOARD_HIDDEN_ROWS;
      const cy = displayRow * cellSize + cellSize / 2;

      for (let i = 0; i < 35; i++) {
        const cx = Math.random() * (BOARD_COLS * cellSize);
        const isMustard = Math.random() > 0.65;
        const speed = 2 + Math.random() * 5;
        const angle = Math.random() * Math.PI * 2;

        this.particles.push({
          x: cx,
          y: cy + (Math.random() - 0.5) * cellSize,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2, // Upward bias
          size: isMustard ? 2 + Math.random() * 2 : 3 + Math.random() * 4,
          color: isMustard
            ? '#111111'
            : Math.random() > 0.3
            ? '#FDD835'
            : '#4ADE80', // Dhokla yellow or coriander green
          alpha: 1,
          life: 0,
          maxLife: 40 + Math.random() * 25,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
          isMustardSeed: isMustard,
        });
      }
    });
  }

  // Main render pass
  public render(
    board: BoardMatrix,
    activePiece: Tetromino | null,
    ghostY: number | null,
    skin: DhoklaSkinId,
    clearingRows: number[] = [],
    clearFlashProgress: number = 0
  ) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cellSize = Math.floor(width / BOARD_COLS);

    this.ensureSpriteCache(cellSize, skin);

    this.ctx.save();
    this.ctx.clearRect(0, 0, width, height);

    // Apply screen shake if active
    if (this.screenShake > 0) {
      const ox = (Math.random() - 0.5) * this.screenShake;
      const oy = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(ox, oy);
      this.screenShake *= 0.82;
      if (this.screenShake < 0.2) this.screenShake = 0;
    }

    // 1. Draw subtle background grid and slots
    this.drawBackgroundGrid(width, height, cellSize);

    // 2. Draw locked blocks on the board
    for (let r = BOARD_HIDDEN_ROWS; r < board.length; r++) {
      const displayRow = r - BOARD_HIDDEN_ROWS;
      const isClearing = clearingRows.includes(r);

      for (let c = 0; c < BOARD_COLS; c++) {
        const cell = board[r][c];
        if (cell !== null) {
          const px = c * cellSize;
          const py = displayRow * cellSize;

          if (isClearing && clearFlashProgress > 0) {
            // Flash golden-white animation before row removal
            this.ctx.save();
            const flashAlpha = Math.sin(clearFlashProgress * Math.PI);
            this.ctx.globalAlpha = 1 - clearFlashProgress * 0.7;
            this.ctx.drawImage(this.offscreenSprite!, px, py);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.8})`;
            this.ctx.fillRect(px, py, cellSize, cellSize);
            this.ctx.restore();
          } else {
            this.ctx.drawImage(this.offscreenSprite!, px, py);
          }
        }
      }
    }

    // 3. Draw Ghost Piece (if active and on-screen)
    if (activePiece && ghostY !== null && this.offscreenGhostSprite) {
      const size = activePiece.matrix.length;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (activePiece.matrix[r][c] !== 0) {
            const boardY = ghostY + r;
            const boardX = activePiece.x + c;
            if (boardY >= 0 && boardY < BOARD_TOTAL_ROWS && boardX >= 0 && boardX < BOARD_COLS) {
              const px = boardX * cellSize;
              const py = (boardY - BOARD_HIDDEN_ROWS) * cellSize;
              if (py + cellSize > 0 && py < height) {
                this.ctx.drawImage(this.offscreenGhostSprite, px, py);
              }
            }
          }
        }
      }
    }

    // 4. Draw Active Piece
    if (activePiece && this.offscreenSprite) {
      const size = activePiece.matrix.length;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (activePiece.matrix[r][c] !== 0) {
            const boardY = activePiece.y + r;
            const boardX = activePiece.x + c;
            if (boardY >= 0 && boardY < BOARD_TOTAL_ROWS && boardX >= 0 && boardX < BOARD_COLS) {
              const px = boardX * cellSize;
              const py = (boardY - BOARD_HIDDEN_ROWS) * cellSize;
              if (py + cellSize > 0 && py < height) {
                this.ctx.drawImage(this.offscreenSprite, px, py);
              }
            }
          }
        }
      }
    }

    // 5. Update and draw particle effects
    this.updateAndDrawParticles();

    this.ctx.restore();
  }

  // Draw subtle board slots
  private drawBackgroundGrid(width: number, height: number, cellSize: number) {
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    this.ctx.lineWidth = 1;

    for (let c = 0; c <= BOARD_COLS; c++) {
      const x = c * cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    for (let r = 0; r <= BOARD_VISIBLE_ROWS; r++) {
      const y = r * cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    // Faint mustard seed background dots at grid intersections
    this.ctx.fillStyle = 'rgba(244, 196, 48, 0.06)';
    for (let r = 1; r < BOARD_VISIBLE_ROWS; r++) {
      for (let c = 1; c < BOARD_COLS; c++) {
        this.ctx.beginPath();
        this.ctx.arc(c * cellSize, r * cellSize, 1, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    this.ctx.restore();
  }

  // Update and draw particles
  private updateAndDrawParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18; // Gravity on crumbs
      p.rotation += p.vRot;
      p.alpha = 1 - p.life / p.maxLife;

      if (p.life >= p.maxLife || p.y > this.canvas.height) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.fillStyle = p.color;

      if (p.isMustardSeed) {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Crumb / flake
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      this.ctx.restore();
    }
  }
}
