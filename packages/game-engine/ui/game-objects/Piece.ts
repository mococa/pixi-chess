/* ---------- External ---------- */
import { Container, Sprite, Spritesheet, Ticker } from "pixi.js";

/* ---------- Core ---------- */
import { Chess, Team, PieceType, Piece as PieceCore } from "@chess/game-engine/core";

/* ---------- Constants ---------- */
import { constants } from "../constants";

/* ---------- Interfaces ---------- */
interface PieceProps {
  game: Chess;
  piece: PieceCore;
  spritesheet: Spritesheet;
  selected: boolean;
  onSelect: (piece: PieceCore | null) => void;
  onHover: (piece: PieceCore) => void;
  onCancel: (piece: PieceCore) => void;
  onDestroy: (piece: Piece) => void;
}

export class Piece {
  game: Chess;
  piece: PieceCore;

  container: Container;
  sprite: Sprite;
  private spritesheet: Spritesheet;
  private target: { x: number; y: number } | null = null;
  private beingCaptured: boolean = false;
  private onDestroy: (piece: Piece) => void;

  constructor({ game, piece, spritesheet, selected, onSelect, onHover, onCancel, onDestroy }: PieceProps) {
    this.game = game;
    this.piece = piece;
    this.onDestroy = onDestroy;
    this.spritesheet = spritesheet;

    this.sprite = new Sprite({
      texture: spritesheet.textures[this.textureName],
      width: constants.tileSize,
      height: constants.tileSize,
    });

    this.container = new Container({
      label: `piece-${this.piece.cell.x}-${this.piece.cell.y}`,
      x: this.piece.cell.x * constants.tileSize,
      y: this.piece.cell.y * constants.tileSize,
      children: [this.sprite],
      eventMode: "dynamic",
      cursor: "pointer",
      onpointerenter: () => {
        if (this.game.turn !== this.piece.team) return;
        onHover(this.piece);
      },
      onpointerleave: () => {
        if (this.game.turn !== this.piece.team) return;

        if (!selected) onCancel(this.piece);
      },
      onpointerdown: () => {
        if (this.game.turn !== this.piece.team) return;

        onSelect(this.piece);
      },
    });
  }

  get textureName() {
    const teams = {
      [Team.White]: "white",
      [Team.Black]: "black",
    };

    const types = {
      [PieceType.Pawn]: "pawn",
      [PieceType.Rook]: "rook",
      [PieceType.Knight]: "knight",
      [PieceType.Bishop]: "bishop",
      [PieceType.Queen]: "queen",
      [PieceType.King]: "king",
    };

    const team = teams[this.piece.team];
    const type = types[this.piece.type];

    if (!team) throw new Error(`Invalid piece team: ${this.piece.team}`);
    if (!type) throw new Error(`Invalid piece type: ${this.piece.type}`);

    return `${team}-${type}`;
  }

  get cell() {
    return this.piece.cell;
  }

  get team() {
    return this.piece.team;
  }

  moveTo(x: number, y: number) {
    this.target = { x, y };
  }

  getCaptured() {
    this.beingCaptured = true;
  }

  promote() {
    const texture = `${Team[this.piece.team]}-${PieceType[this.piece.type]}`.toLowerCase();
    this.sprite.texture = this.spritesheet.textures[texture];
    this.sprite.texture.updateUvs();
  }

  update(ticker: Ticker) {
    if (this.game.turn === this.piece.team) {
      if (this.container.eventMode !== "dynamic") {
        this.container.eventMode = "dynamic";
      }
    } else {
      if (this.container.eventMode !== "none") {
        this.container.eventMode = "none";
      }
    }

    if (this.beingCaptured) {
      this.container.scale.set(
        lerp(this.container.scale.x, 0, ticker.deltaTime * 0.5),
        lerp(this.container.scale.y, 0, ticker.deltaTime * 0.5),
      );

      this.container.alpha = lerp(this.container.alpha, 0, ticker.deltaTime * 0.5);
      if (this.container.alpha <= 0.01) {
        this.onDestroy(this);
      }

      return;
    }

    if (this.game.turn !== this.piece.team) {
      this.container.alpha = 0.5;
    } else {
      this.container.alpha = 1;
    }

    if (!this.target) return;

    const { x, y } = this.target;
    this.container.position.set(
      lerp(this.container.x, x * constants.tileSize, 0.1),
      lerp(this.container.y, y * constants.tileSize, 0.1),
    );

    if (
      Math.abs(this.container.x - x * constants.tileSize) < 1 &&
      Math.abs(this.container.y - y * constants.tileSize) < 1
    ) {
      this.target = null;
    }
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
