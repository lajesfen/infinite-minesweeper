const ICON_SIZE = 8;
const ICON_COLUMNS = 4;

const ICON_INDEX = {
  number1: 0,
  number2: 1,
  number3: 2,
  number4: 3,
  number5: 4,
  number6: 5,
  number7: 6,
  number8: 7,
  flag: 8,
  bomb: 9,
} as const;

export type IconName = keyof typeof ICON_INDEX;

type IconData = {
  image: HTMLImageElement | null;
  sourceX: number;
  sourceY: number;
};

const iconsImage = typeof Image !== "undefined" ? new Image() : null;

if (iconsImage) {
  iconsImage.src = "/icons.png";
}

export function getIcon(name: IconName) {
  const index = ICON_INDEX[name];

  return {
    image: iconsImage,
    sourceX: (index % ICON_COLUMNS) * ICON_SIZE,
    sourceY: Math.floor(index / ICON_COLUMNS) * ICON_SIZE,
  } satisfies IconData;
}

export function getIconStyle(name: IconName, size: number) {
  const index = ICON_INDEX[name];
  const column = index % ICON_COLUMNS;
  const row = Math.floor(index / ICON_COLUMNS);
  const sheetSize = size * ICON_COLUMNS;

  return {
    display: "block",
    width: `${size}px`,
    height: `${size}px`,
    backgroundImage: 'url("/icons.png")',
    backgroundRepeat: "no-repeat",
    backgroundSize: `${sheetSize}px ${sheetSize}px`,
    backgroundPosition: `-${column * size}px -${row * size}px`,
    imageRendering: "pixelated" as const,
  };
}
