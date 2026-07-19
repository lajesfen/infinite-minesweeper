import type { GameOverStats } from "@/app/lib/gameState";
import { getIconStyle } from "../lib/icons";

export function GameOverModal({ stats }: { stats: GameOverStats }) {
  return (
    <div className="fixed flex items-center justify-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-over-title"
        className="w-full min-w-sm max-w-lg rounded-xl bg-white/80 border-2 border-white p-6 text-black shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 id="game-over-title" className="text-2xl font-bold">
              Game Over
            </h2>
            <p className="text-sm">You hit a bomb :(</p>
          </div>
        </div>

        <ul className="flex flex-col text-sm">
          <li>
            <p>
              Revealed cells:{" "}
              <span className="font-bold">{stats.revealedCells}</span>
            </p>
          </li>
          <li>
            <p className="flex items-center gap-1">
              Correct flags:{" "}
              <span className="font-bold">{stats.correctFlags}</span>
              <span style={getIconStyle("flag", 20)} />
            </p>
          </li>
          <li>
            <p className="flex items-center gap-1">
              Incorrect flags:{" "}
              <span className="font-bold">{stats.incorrectFlags}</span>
              <span style={getIconStyle("flag", 20)} />
            </p>
          </li>
          <li>
            <p>
              Playtime:{" "}
              <span className="font-bold">
                {(stats.playtime / 1000).toFixed(2)}s
              </span>
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
}
