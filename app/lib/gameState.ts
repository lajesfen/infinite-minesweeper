import { hashCoords } from "./seed";

export type CellState = {
  revealed: boolean;
  flagged: boolean;
};

export type GameOverStats = {
  revealedCells: number;
  correctFlags: number;
  incorrectFlags: number;
  playtime: number;
};

function cellKey(x: number, y: number) {
  return `${x},${y}`;
}

const BOMB_DENSITY = 0.16;

export class GameState {
  gameOver = false;

  private cells = new Map<string, CellState>();
  private safeZone: { x: number; y: number; radius: number } | null = null;

  constructor(private seed: number) {}

  setSafeZone(x: number, y: number, radius = 1) {
    this.safeZone = { x, y, radius };
  }

  isBomb(x: number, y: number): boolean {
    if (this.safeZone) {
      const { x: sx, y: sy, radius } = this.safeZone;
      if (Math.abs(x - sx) <= radius && Math.abs(y - sy) <= radius)
        return false;
    }
    return hashCoords(x, y, this.seed) < BOMB_DENSITY;
  }

  peek(x: number, y: number): CellState | undefined {
    return this.cells.get(cellKey(x, y));
  }

  private getOrCreate(x: number, y: number): CellState {
    const k = cellKey(x, y);
    let cell = this.cells.get(k);
    if (!cell) {
      cell = { revealed: false, flagged: false };
      this.cells.set(k, cell);
    }
    return cell;
  }

  countAdjacentBombs(x: number, y: number): number {
    let count = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        if (this.isBomb(x + dx, y + dy)) count++;
      }
    }
    return count;
  }

  reveal(startX: number, startY: number) {
    const queue: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      const k = cellKey(x, y);
      if (visited.has(k)) continue;
      visited.add(k);

      const cell = this.getOrCreate(x, y);
      if (cell.flagged || cell.revealed) continue;
      cell.revealed = true;

      if (this.isBomb(x, y)) {
        this.gameOver = true;
        continue;
      }

      if (this.countAdjacentBombs(x, y) === 0) {
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            queue.push([x + dx, y + dy]);
          }
        }
      }
    }
  }

  toggleFlag(x: number, y: number) {
    const cell = this.getOrCreate(x, y);
    if (cell.revealed) return;
    cell.flagged = !cell.flagged;
  }

  getGameOverStats(playtime: number): GameOverStats {
    let revealedCells = 0;
    let correctFlags = 0;
    let incorrectFlags = 0;

    for (const [key, cell] of this.cells) {
      if (cell.revealed) {
        revealedCells++;
      }

      if (!cell.flagged) continue;

      const [x, y] = key.split(",").map(Number);
      if (this.isBomb(x, y)) {
        correctFlags++;
      } else {
        incorrectFlags++;
      }
    }

    return { revealedCells, correctFlags, incorrectFlags, playtime };
  }
}
