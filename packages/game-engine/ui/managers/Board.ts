/* ---------- External ---------- */
import { Container, Ticker } from "pixi.js";

/* ---------- Core ---------- */
import { Cell, Chess, Piece } from "@chess/game-engine/core";

/* ---------- Game Objects ---------- */
import { Tile } from "../game-objects/Tile";

/* ---------- Interfaces ---------- */
interface BoardProps {
  game: Chess;
}

export class Board {
  game: Chess;
  container: Container;
  tiles: Set<Tile>;
  selection: Piece | null = null;

  constructor({ game }: BoardProps) {
    this.game = game;
    this.tiles = new Set();
    this.container = new Container({
      label: "board",
    });

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const tile = new Tile(x, y);
        tile.setOnClick(() => {
          if (!this.selection) return;

          const cell = game.board.at(tile.x, tile.y);

          const [_, err] = this.game.move(this.selection.cell, cell);
          if (err) return console.log("error:", err);
        });

        this.tiles.add(tile);

        this.container.addChild(tile.container);
      }
    }
  }

  onPieceSelection(piece: Piece) {
    this.selection = piece;

    this.tiles.forEach((tile) => tile.hidePossibleMoves());
    if (!piece) return;

    const checkFilter = (cell: Cell) => {
      const { isGameOver, state } = piece.board.game;
      if (isGameOver) return false;
      if (state === "check") return piece.removesCheckOn(cell);
      if (piece.wouldBeInCheck(cell)) return false;
      return true;
    };

    const moves = piece.getLegalMoves().filter(checkFilter);
    if (!moves.length) {
      this.selection = null;
      return;
    }

    this.tiles.forEach((tile) => {
      const valid = moves.some((move) => move.x === tile.x && move.y === tile.y);
      if (!valid) return;

      tile.showPossibleMoves();
    });
  }

  /**
   * @description
   * Updates the board tiles at every frame.
   * 
   * @param {Ticker} ticker The ticker object.
   */
  update(ticker: Ticker) {
    this.tiles.forEach((tile) => tile.update(ticker));
  }
}
