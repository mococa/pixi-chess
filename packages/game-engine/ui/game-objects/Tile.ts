/* ---------- External ---------- */
import { Container, Graphics, Ticker } from "pixi.js";

/* ---------- Constants ---------- */
import { constants } from "../constants";

export class Tile {
  container: Container;
  background: Graphics;
  marker: Graphics;
  overlay: Graphics;
  possibleMove: boolean;
  hovering: boolean;
  x: number;
  y: number;
  alpha: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    const width = constants.tileSize;
    const height = constants.tileSize;

    this.background = new Graphics().rect(0, 0, width, height).fill({ color: this.color });

    this.marker = new Graphics();

    this.overlay = new Graphics();

    this.container = new Container({
      width,
      height,
      x: x * width,
      y: y * height,
      interactive: true,
      cursor: "pointer",
      onpointerenter: () => {
        this.hovering = true;
      },
      onpointerleave: () => {
        this.hovering = false;
      },
      children: [this.background, this.overlay, this.marker],
    });
  }

  setOnClick(callback: () => void) {
    this.container.on("pointerdown", callback);
  }

  showPossibleMoves() {
    this.possibleMove = true;

    const width = constants.tileSize;
    const height = constants.tileSize;

    const x = width / 2;
    const y = height / 2;
    const size = 10;
    const color = constants.colors.marker;

    this.overlay.clear().rect(0, 0, width, height).fill({ color: 0x000000, alpha: 0 });

    this.marker.circle(x, y, size).fill({ color, alpha: 0.25 });
  }

  hidePossibleMoves() {
    this.possibleMove = false;

    this.alpha = 0;
    this.overlay.clear();
    this.marker.clear();
  }

  update(ticker: Ticker) {
    if (!this.possibleMove) return;

    const alphaTarget = this.hovering ? 0.25 : 0;
    this.alpha = lerp(this.alpha, alphaTarget, ticker.deltaTime / 3);

    if (this.hovering) {
      this.overlay
        .clear()
        .rect(0, 0, constants.tileSize, constants.tileSize)
        .fill({ color: 0x000000, alpha: this.alpha });
    } else {
      this.overlay
        .clear()
        .rect(0, 0, constants.tileSize, constants.tileSize)
        .fill({ color: 0x000000, alpha: this.alpha });
    }
  }

  get color() {
    const whiteTile = (this.x + this.y) % 2 === 0;

    return whiteTile ? constants.colors.whileTile : constants.colors.blackTile;
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
