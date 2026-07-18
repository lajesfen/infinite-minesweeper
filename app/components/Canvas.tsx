"use client";

import { screenToCell, type Camera } from "@/app/lib/camera";
import { GameState } from "@/app/lib/gameState";
import { drawBoard } from "@/app/lib/render";
import { useEffect, useRef } from "react";

const CELL_SIZE = 32;
const DRAG_THRESHOLD = 4;

export function Canvas({ seed }: { seed: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const cameraRef = useRef<Camera>({ x: 0, y: 0 });
  const firstClickDoneRef = useRef(false);
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    camStartX: 0,
    camStartY: 0,
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
      redraw();
    };

    const handleFlag = (x: number, y: number) => {
      if (state.gameOver || !firstClickDoneRef.current) return;
      state.toggleFlag(x, y);
      redraw();
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      dragRef.current = {
        active: true,
        moved: false,
        startX: e.clientX,
        startY: e.clientY,
        camStartX: cameraRef.current.x,
        camStartY: cameraRef.current.y,
      };
    };

    const onMouseMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag.active) return;
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

    const onMouseUp = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (drag.active && !drag.moved) {
        const rect = canvas.getBoundingClientRect();
        const { x, y } = screenToCell(
          cameraRef.current,
          e.clientX - rect.left,
          e.clientY - rect.top,
          CELL_SIZE,
        );
        handleReveal(x, y);
      }
      drag.active = false;
      drag.moved = false;
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const { x, y } = screenToCell(
        cameraRef.current,
        e.clientX - rect.left,
        e.clientY - rect.top,
        CELL_SIZE,
      );
      handleFlag(x, y);
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("contextmenu", onContextMenu);

    resize();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("contextmenu", onContextMenu);
    };
  }, [seed]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
}
