/* ---------- External ---------- */
import { Application } from "pixi.js";

/* ---------- Packages ---------- */
import { Chess } from "@chess/game-engine/core";

/* ---------- Modes ---------- */
import { ClassicMode } from "./modes/classic";
import { GameMode } from "./modes/mode";

/* ---------- Constants ---------- */
import { constants } from "./constants";

/* ---------- Interfaces ---------- */
interface ClientProps {
  element: HTMLElement;
  onLoadFinished?: () => void;
}

export class Client {
  game: Chess;
  mode: GameMode;
  application: Application;
  element: HTMLElement;
  onLoadFinished?: () => void;

  constructor({ element, onLoadFinished }: ClientProps) {
    this.element = element;
    this.onLoadFinished = onLoadFinished;

    this.game = new Chess();
    this.application = new Application();
  }

  async start() {
    await this.application.init({
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
      hello: true,
      preference: "webgl",
      resolution: window.devicePixelRatio,
      autoDensity: true,
      eventMode: "passive",
      backgroundAlpha: 0,
      resizeTo: this.element,
    });

    constants.tileSize = Math.min(this.application.renderer.width, this.application.renderer.height) / 8;

    this.element.onresize = this.resize.bind(this);

    this.element.appendChild(this.application.canvas);

    const mode = new ClassicMode({ game: this.game });
    await mode.load();

    this.mode = mode;
    this.mode.start();

    this.application.ticker.add(this.mode.update.bind(this.mode));
    this.application.stage.addChild(mode.board.container);

    if (this.onLoadFinished) this.onLoadFinished();
  }

  private resize() {
    this.application.renderer.resize(this.element.clientWidth, this.element.clientHeight);
    constants.tileSize = Math.min(this.application.renderer.width, this.application.renderer.height) / 8;
  }
}
