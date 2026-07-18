export type Camera = {
  x: number;
  y: number;
};

export function screenToCell(
  camera: Camera,
  screenX: number,
  screenY: number,
  cellSize: number,
) {
  const worldX = screenX + camera.x;
  const worldY = screenY + camera.y;
  return {
    x: Math.floor(worldX / cellSize),
    y: Math.floor(worldY / cellSize),
  };
}
