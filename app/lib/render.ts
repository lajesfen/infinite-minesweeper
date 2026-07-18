import type { Camera } from "./camera";
import type { GameState } from "./gameState";

const NUMBER_COLORS = [
  "",
  "#0000FF",
  "#008000",
  "#FF0000",
  "#000080",
  "#800000",
  "#008080",
  "#000000",
  "#808080",
];

export function drawBoard(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  camera: Camera,
  state: GameState,
  cellSize: number,
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const startCellX = Math.floor(camera.x / cellSize);
  const startCellY = Math.floor(camera.y / cellSize);
  const endCellX = Math.ceil((camera.x + canvas.width) / cellSize);
  const endCellY = Math.ceil((camera.y + canvas.height) / cellSize);

  for (let x = startCellX; x <= endCellX; x++) {
    for (let y = startCellY; y <= endCellY; y++) {
      drawCell(
        ctx,
        state,
        x,
        y,
        x * cellSize - camera.x,
        y * cellSize - camera.y,
        cellSize,
      );
    }
  }
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  x: number,
  y: number,
  posX: number,
  posY: number,
  cellSize: number,
) {
  const cell = state.peek(x, y);

  if (!cell || (!cell.revealed && !cell.flagged)) {
    drawUnrevealed(ctx, posX, posY, cellSize, cell?.flagged ?? false);
    return;
  }

  drawRevealed(ctx, state, x, y, posX, posY, cellSize);
}

function drawUnrevealed(
  ctx: CanvasRenderingContext2D,
  posX: number,
  posY: number,
  cellSize: number,
  flagged: boolean,
) {
  ctx.fillStyle = "#c6c6c6";
  ctx.fillRect(posX, posY, cellSize, cellSize);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(posX, posY, cellSize, 3);
  ctx.fillRect(posX, posY, 3, cellSize);
  ctx.fillStyle = "#808080";
  ctx.fillRect(posX + cellSize - 3, posY, 3, cellSize);
  ctx.fillRect(posX, posY + cellSize - 3, cellSize, 3);

  if (flagged) {
    ctx.fillStyle = "red";
    ctx.font = `${cellSize * 0.6}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🚩", posX + cellSize / 2, posY + cellSize / 2);
  }
}

function drawRevealed(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  x: number,
  y: number,
  posX: number,
  posY: number,
  cellSize: number,
) {
  ctx.fillStyle = "#e0e0e0";
  ctx.fillRect(posX, posY, cellSize, cellSize);
  ctx.strokeStyle = "#bdbdbd";
  ctx.strokeRect(posX, posY, cellSize, cellSize);

  if (state.isBomb(x, y)) {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(
      posX + cellSize / 2,
      posY + cellSize / 2,
      cellSize * 0.25,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    return;
  }

  const count = state.countAdjacentBombs(x, y);
  if (count > 0) {
    ctx.fillStyle = NUMBER_COLORS[count];
    ctx.font = `bold ${cellSize * 0.5}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(count), posX + cellSize / 2, posY + cellSize / 2);
  }
}
