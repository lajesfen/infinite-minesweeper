import type { GameOverStats } from "@/app/lib/gameState";
import { getIconStyle } from "@/app/lib/icons";

type GameOverSummary = GameOverStats & {
  playtimeMs: number;
};

export function GameOverModal({ summary }: { summary: GameOverSummary }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-over-title"
        className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-950/95 p-6 text-white shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 id="game-over-title" className="text-2xl font-bold">
              Game Over
            </h2>
            <p className="text-sm text-white/70">You hit a bomb.</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15">
            <span style={getIconStyle("bomb", 28)} />
          </div>
        </div>

        <div className="grid gap-3 text-sm">
          <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
            <span className="text-white/70">Cells revealed</span>
            <span className="text-base font-semibold">{summary.revealedCells}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
            <span className="text-white/70">Correct flags</span>
            <span className="text-base font-semibold">{summary.correctFlags}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
            <span className="text-white/70">Incorrect flags</span>
            <span className="text-base font-semibold">{summary.incorrectFlags}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
            <span className="text-white/70">Playtime</span>
            <span className="text-base font-semibold">
              {(summary.playtimeMs / 1000).toFixed(2)}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
