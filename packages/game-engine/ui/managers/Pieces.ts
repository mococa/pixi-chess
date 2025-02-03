/* ---------- External ---------- */
import { Container, Spritesheet, Ticker } from "pixi.js";

/* ---------- Core ---------- */
import { Chess, Piece as PieceCore } from "@chess/game-engine/core";

/* ---------- Game Objects ---------- */
import { Piece } from "../game-objects/Piece";

/* ---------- Spritesheets ---------- */
import type spritesheet from "../assets/spritesheet.json";

/* ---------- Interfaces ---------- */
interface PiecesProps {
  game: Chess;
  spritesheets: {
    game: Spritesheet<typeof spritesheet>;
  };
  setPreselection: (piece: PieceCore | null) => void;
}

export class Pieces {
  pieces: Set<Piece>;
  game: Chess;
  container: Container;
  selected: PieceCore | null = null;
  setPreselection: (piece: PieceCore | null) => void;

  constructor({ game, spritesheets, setPreselection }: PiecesProps) {
    this.game = game;
    this.setPreselection = setPreselection;

    this.game.events.on("move", () => {
      this.selected = null;
      setPreselection(null);
    });

    this.pieces = new Set(
      game.board.pieces.map((p) => {
        const piece = new Piece({
          game,
          piece: p,
          spritesheet: spritesheets.game,
          selected: this.selected === p,
          onSelect: (piece) => {
            if (piece === this.selected) {
              setPreselection(null);
              this.selected = null;
              return;
            }
            this.selected = piece;
            setPreselection(piece);
          },
          onCancel: () => {
            if (!this.selected) {
              setPreselection(null);
            }
            // Check if it's the selected piece and if so
            // starts the debounce to remove the preselection
          },
          onHover: (piece) => {
            if (!this.selected) {
              setPreselection(piece);
            }
            // Check if it's different from the selected piece
            // If so, restarts the debounce
            // And if not, set as preselection
          },
          onDestroy: (piece) => {
            this.container.removeChild(piece.container);
            this.pieces.delete(piece);
          },
        });

        return piece;
      }),
    );

    this.container = new Container({
      children: Array.from(this.pieces).map((piece) => piece.container),
    });
  }

  /**
   * @description
   * Returns the piece at the given coordinates.
   *
   * @param x X Coordinate
   * @param y Y Coordinate
   * @returns The piece at the given coordinates, if any.
   */
  at(x: number, y: number, opts?: { ignoreCaptured: boolean }) {
    for (const piece of this.pieces) {
      if (opts?.ignoreCaptured && piece.piece.captured) continue;

      if (piece.piece.cell.x === x && piece.piece.cell.y === y) {
        return piece;
      }
    }
  }

  /**
   * @description
   * Updates the piece game objects at every frame.
   *
   * @param {Ticker} ticker The ticker object.
   */
  update(ticker: Ticker) {
    this.pieces.forEach((piece) => piece.update(ticker));
  }
}
