/* ---------- External ---------- */
import { Assets, Spritesheet, Ticker } from "pixi.js";

/* ---------- Core ---------- */
import { PieceType, Team, type Chess, type Piece } from "@chess/game-engine/core";

/* ---------- Managers ---------- */
import { Board } from "../managers/Board";
import { Pieces } from "../managers/Pieces";

/* ---------- Game Modes ---------- */
import { GameMode } from "./mode";

/* ---------- Spritesheet ---------- */
import spritesheet from "../assets/spritesheet.json";

/* ---------- Interfaces ---------- */
interface ClassicModeProps {
  game: Chess;
}

/**
 * @description
 * Classic game mode.
 */
export class ClassicMode extends GameMode {
  board: Board;
  pieces: Pieces;
  spritesheets: {
    game: Spritesheet<typeof spritesheet>;
  };
  preselection: Piece | null = null;

  constructor({ game }: ClassicModeProps) {
    super();

    this.game = game;
  }

  async load() {
    Assets.addBundle(
      "spritesheet",
      [spritesheet].map((sheet) => ({
        alias: sheet.meta.name,
        src: spritesheet.meta.image,
      })),
    );

    await Assets.loadBundle("spritesheet");

    this.spritesheets = {
      game: new Spritesheet(Assets.cache.get("spritesheet"), spritesheet),
    };

    await this.spritesheets.game.parse();
  }

  start() {
    this.board = new Board({
      game: this.game,
    });

    this.pieces = new Pieces({
      game: this.game,
      spritesheets: this.spritesheets,
      setPreselection: (piece) => {
        this.preselection = piece;
        this.board.onPieceSelection(piece);
      },
    });

    this.game.events.on("check", ({ team }) => {
      const incheck = team === Team.White ? "whites" : "blacks";
      console.log(`${incheck} in check.`);
    });

    this.game.events.on("checkmate", ({ team }) => {
      const won = team === Team.White ? "whites" : "blacks";
      console.log(`checkmate: ${won} win!`);

      setTimeout(() => {
        alert(`checkmate:\n${won} win!`);
      }, 500);
    });

    this.game.events.on("stalemate", () => {
      setTimeout(() => {
        alert(`stalemate!`);
      }, 500);
    });

    this.game.events.on("move", ({ from, to }) => {
      const piece = this.pieces.at(from.x, from.y); // UI Piece
      if (!piece) return;

      piece.moveTo(to.x, to.y);
    });

    this.game.events.on("move-finished", () => {
      this.board.onPieceSelection(null);
    });

    this.game.events.on("capture", ({ cell }) => {
      const piece = this.pieces.at(cell.x, cell.y); // UI Piece
      if (!piece) return;

      piece.getCaptured();
    });

    this.game.events.on("promotion", ({ cell, type }) => {
      const piece = this.pieces.at(cell.x, cell.y, { ignoreCaptured: true }); // UI Piece
      if (!piece) return;

      console.log(`promotion at ${cell.notation} to ${PieceType[type]}`);

      piece.piece.type = type;
      piece.promote();
    });

    this.board.container.addChild(this.pieces.container);
  }

  /**
   * @description
   * Updates all the managers, that are responsible for updating their own game
   * objects, at every frame.
   *
   * @param {Ticker} ticker The ticker object.
   */
  update(ticker: Ticker) {
    this.board.update(ticker);
    this.pieces.update(ticker);
  }
}
