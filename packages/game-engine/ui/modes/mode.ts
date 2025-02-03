/* ---------- External ---------- */
import { Ticker } from "pixi.js";

/* ---------- Core ---------- */
import type { Chess } from "@chess/game-engine/core";

/**
 * @description
 * Game mode abstract class with a game core logic instance
 * and required methods all game modes should implement.
 */
export abstract class GameMode {
  /**
   * @description
   * Game instance
   */
  game: Chess;

  /**
   * @description
   * Loads all the game mode assets and parses all
   * the spritesheets too.
   */
  abstract load(): Promise<void>;

  /**
   * @description
   * Starts the game mode, after loaded.
   */
  abstract start(): void;

  /**
   * @description
   * Updates all managers.
   *
   * @param {Ticker} ticker Ticker to update the UI
   */
  abstract update(ticker: Ticker): void;
}
