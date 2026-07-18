"use client";

import { screenToCell, type Camera } from "@/app/lib/camera";
import { GameState, type GameOverStats } from "@/app/lib/gameState";
import { getIconStyle } from "@/app/lib/icons";
import { drawBoard } from "@/app/lib/render";
import { useEffect, useRef, useState } from "react";
import { GameOverModal } from "./GameOverModal";

const CELL_SIZE = 32;
const DRAG_THRESHOLD = 4;

type Point = {
  x: number;
  y: number;
};

type GameOverSummary = GameOverStats & {
  playtimeMs: number;
};

export function Canvas({ seed }: { seed: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const cameraRef = useRef<Camera>({ x: 0, y: 0 });
  const firstClickDoneRef = useRef(false);
  const firstActionTimeRef = useRef<number | null>(null);
  const [flagMode, setFlagMode] = useState(false);
  const [flagPreviewPosition, setFlagPreviewPosition] = useState<Point | null>(
    null,
  );
  const [gameOverSummary, setGameOverSummary] =
    useState<GameOverSummary | null>(null);
  const lastPointerPositionRef = useRef<Point | null>(null);
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    camStartX: 0,
    camStartY: 0,
    pointerId: -1,
  });

  if (!gameStateRef.current) {
    gameStateRef.current = new GameState(seed);
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const state = gameStateRef.current!;

    const redraw = () =>
      drawBoard(ctx, canvas, cameraRef.current, state, CELL_SIZE);

    const recordFirstAction = () => {
      if (firstActionTimeRef.current === null) {
        firstActionTimeRef.current = Date.now();
      }
    };

    const showGameOverSummary = () => {
      const startedAt = firstActionTimeRef.current ?? Date.now();
      const stats = state.getGameOverStats();
      setGameOverSummary({
        ...stats,
        playtimeMs: Date.now() - startedAt,
      });
      setFlagMode(false);
      setFlagPreviewPosition(null);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redraw();
    };

    const handleReveal = (x: number, y: number) => {
      if (state.gameOver) return;
      if (!firstClickDoneRef.current) {
        firstClickDoneRef.current = true;
        state.setSafeZone(x, y, 1);
      }
      state.reveal(x, y);
      console.log(`Revealed cell at (${x}, ${y})`);
      redraw();

      if (state.gameOver) {
        showGameOverSummary();
      }
    };

    const handleFlag = (x: number, y: number) => {
      if (state.gameOver) return;
      state.toggleFlag(x, y);
      console.log(`Toggled flag at (${x}, ${y})`);
      redraw();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragRef.current = {
        active: true,
        moved: false,
        startX: e.clientX,
        startY: e.clientY,
        camStartX: cameraRef.current.x,
        camStartY: cameraRef.current.y,
        pointerId: e.pointerId,
      };
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (gameOverSummary) return;
      lastPointerPositionRef.current = { x: e.clientX, y: e.clientY };
      if (flagMode) {
        setFlagPreviewPosition({ x: e.clientX, y: e.clientY });
      }

      const drag = dragRef.current;
      if (!drag.active || drag.pointerId !== e.pointerId) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        drag.moved = true;
      }
      if (drag.moved) {
        cameraRef.current.x = drag.camStartX - dx;
        cameraRef.current.y = drag.camStartY - dy;
        redraw();
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (gameOverSummary) return;
      const drag = dragRef.current;
      if (drag.active && drag.pointerId === e.pointerId && !drag.moved) {
        const rect = canvas.getBoundingClientRect();
        const { x, y } = screenToCell(
          cameraRef.current,
          e.clientX - rect.left,
          e.clientY - rect.top,
          CELL_SIZE,
        );
        const cell = state.peek(x, y);

        recordFirstAction();

        if (cell?.flagged) {
          handleFlag(x, y);
        } else if (flagMode) {
          handleFlag(x, y);
          setFlagMode(false);
          setFlagPreviewPosition(null);
        } else {
          handleReveal(x, y);
        }
      }
      if (
        drag.pointerId === e.pointerId &&
        canvas.hasPointerCapture(e.pointerId)
      ) {
        canvas.releasePointerCapture(e.pointerId);
      }
      drag.active = false;
      drag.moved = false;
      drag.pointerId = -1;
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (gameOverSummary) return;
      const drag = dragRef.current;
      if (
        drag.pointerId === e.pointerId &&
        canvas.hasPointerCapture(e.pointerId)
      ) {
        canvas.releasePointerCapture(e.pointerId);
      }
      drag.active = false;
      drag.moved = false;
      drag.pointerId = -1;
    };

    const onContextMenu = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    canvas.addEventListener("contextmenu", onContextMenu);

    resize();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      canvas.removeEventListener("contextmenu", onContextMenu);
    };
  }, [seed, flagMode, gameOverSummary]);

  return (
    <div className="relative flex flex-col flex-1 items-center justify-center overflow-hidden">
      {gameOverSummary ? <GameOverModal summary={gameOverSummary} /> : null}
      <button
        type="button"
        onClick={() => {
          if (gameOverSummary) return;
          if (flagMode) return;
          setFlagMode(true);
          setFlagPreviewPosition(
            lastPointerPositionRef.current ?? {
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
            },
          );
        }}
        aria-pressed={flagMode}
        aria-label="Flag mode"
        className={`absolute bottom-4 left-1/2 z-10 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border shadow-lg transition ${
          flagMode
            ? "border-amber-300 bg-amber-400"
            : "border-white/20 bg-slate-900/80"
        }`}
      >
        <span style={getIconStyle("flag", 28)} />
      </button>
      {flagMode && flagPreviewPosition ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-20"
          style={{
            left: `${flagPreviewPosition.x}px`,
            top: `${flagPreviewPosition.y}px`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <span style={getIconStyle("flag", 32)} />
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        className="block touch-none [image-rendering:pixelated]"
      />
    </div>
  );
}
