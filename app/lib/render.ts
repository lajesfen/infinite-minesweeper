import type { Camera } from "./camera";
import type { GameState } from "./gameState";
import { getIcon, IconName } from "./icons";

const ICON_DRAW_SIZE_RATIO = 0.75;

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

  if (!cell || !cell.revealed) {
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
  ctx.fillStyle = "#eaecef";
  ctx.fillRect(posX, posY, cellSize, cellSize);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(posX, posY, cellSize, 2);
  ctx.fillRect(posX, posY, 2, cellSize);
  ctx.fillStyle = "#ccd0d5";
  ctx.fillRect(posX + cellSize - 2, posY, 2, cellSize);
  ctx.fillStyle = "#b1b7bf";
  ctx.fillRect(posX, posY + cellSize - 2, cellSize, 2);

  if (flagged) {
    drawIcon(ctx, "flag", posX, posY, cellSize);
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
  ctx.fillStyle = "#eaecef";
  ctx.fillRect(posX, posY, cellSize, cellSize);
  ctx.strokeStyle = "#ccd0d5";
  ctx.strokeRect(posX, posY, cellSize, cellSize);

  if (state.isBomb(x, y)) {
    drawIcon(ctx, "bomb", posX, posY, cellSize);
    return;
  }

  const count = state.countAdjacentBombs(x, y);
  if (count > 0) {
    drawIcon(ctx, getNumberIconName(count), posX, posY, cellSize);
  }
}

function drawIcon(
  ctx: CanvasRenderingContext2D,
  iconName: IconName,
  posX: number,
  posY: number,
  cellSize: number,
) {
  const icon = getIcon(iconName);
  if (!icon.image || !icon.image.complete || icon.image.naturalWidth === 0)
    return;

  const drawSize = cellSize * ICON_DRAW_SIZE_RATIO;
  const drawX = posX + (cellSize - drawSize) / 2;
  const drawY = posY + (cellSize - drawSize) / 2;

  const previousSmoothing = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    icon.image,
    icon.sourceX,
    icon.sourceY,
    8,
    8,
    drawX,
    drawY,
    drawSize,
    drawSize,
  );
  ctx.imageSmoothingEnabled = previousSmoothing;
}

function getNumberIconName(count: number): IconName {
  switch (count) {
    case 1:
      return "one";
    case 2:
      return "two";
    case 3:
      return "three";
    case 4:
      return "four";
    case 5:
      return "five";
    case 6:
      return "six";
    case 7:
      return "seven";
    case 8:
      return "eight";
    default:
      return "one";
  }
}
