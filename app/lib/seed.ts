export function randomSeed(): number {
  return (Math.random() * 2 ** 31) | 0;
}

export function encodeSeed(seed: number): string {
  return (seed >>> 0).toString(36);
}

export function decodeSeed(id: string): number {
  return parseInt(id, 36) | 0;
}

export function hashCoords(x: number, y: number, seed: number): number {
  let h = seed ^ Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967295;
}
