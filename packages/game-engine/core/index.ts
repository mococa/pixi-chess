/* ---------- Core ---------- */
import { Board } from "./Board";
import { Piece } from "./Piece";
import { Events } from "./Events";

/* ---------- Packages ---------- */
import { Vector2 } from "@chess/maths";

export class Chess {
  turn: Team;
  board: Board;
  state: "playing" | "check" | "checkmate" | "stalemate" | "draw" | "gameover";
  events: Events;

  /** Piece that is attacking the king, causing the check */
  attacker: Piece = null;

  constructor() {
    this.turn = Team.White;
    this.board = new Board(this);
    this.state = "playing";
    this.events = new Events();

    this.events.on("move-finished", () => {
      const teamInCheck = this.inCheck();
      const pieces = this.board.getTeamUncapturedPieces(this.turn);

      // 🔵 checking for stalemate (no legal moves not in check)
      if (teamInCheck === Team.None) {
        const stalemate = pieces.every((piece) => {
          const moves = piece.getLegalMoves();

          return moves.every((cell) => piece.wouldBeInCheck(cell));
        });

        if (stalemate) {
          this.state = "stalemate";
          this.events.emit("stalemate", {});
          return;
        }

        // 🟢 normal state or removed check
        this.state = "playing";
        return;
      }

      this.state = "check";
      this.events.emit("check", { team: teamInCheck });

      // 🔴 checking for checkmate (no legal moves and is in check)
      if (pieces.some((piece) => piece.getLegalMoves().some((cell) => piece.removesCheckOn(cell)))) {
        return;
      }

      this.state = "checkmate";
      this.events.emit("checkmate", { team: this.attacker.team });
    });

    this.events.on("move-finished", ({ to, team, from }) => {
      const piece = this.board.getPiece(to);
      if (piece.captured) return;
      if (piece.team !== team) return;

      if (piece.type === PieceType.Pawn) {
        if (to.y === 7 || to.y === 0) {
          this.events.emit("promotion-available", { team, cell: this.board.getCell(to) });
        }
      }
    });

    // TODO: implement this promotion event on UI instead of core. this is automatically promoting to queen.
    this.events.on("promotion-available", ({ cell }) => {
      const piece = this.board.getPiece(cell);
      piece.promote(PieceType.Queen);
    });
  }

  /**
   * @description
   * Moves a piece from one cell to another, registering a player turn.
   *
   * @param from Location of the piece to move.
   * @param to Location to move the piece to.
   */
  move(from: Vector2, to: Vector2): [success: boolean, error: string] {
    if (this.isGameOver) return [false, "the game is already over."];

    const piece = this.board.getPiece(from);
    if (!piece) return [false, "no piece? this should never happen."];

    const moves = piece.getLegalMoves();
    if (!moves.some((move) => move.equals(to)))
      return [false, "illegal move. this piece cannot go in there."];

    if (piece.captured)
      return [false, "piece is captured. you shouldnt be even seeing this piece in the first place."];

    if (piece.team !== this.turn) return [false, "not your turn. wait."];

    if (this.state === "check") {
      const solution = piece.removesCheckOn(to);
      if (!solution) return [false, "you would still be in check in there."];
    } else {
      if (piece.wouldBeInCheck(to)) return [false, "you would be in check there. illegal."];
    }

    this.state = "playing";

    this.events.emit("move", { team: piece.team, from, to });

    const victim = this.board.getPiece(to);
    if (victim) {
      victim.captured = true;
      this.events.emit("capture", { piece: victim, cell: victim.cell, team: piece.team });
    }

    const target = this.board.getCell(to);
    piece.setCell(target);

    this.turn = this.turn === Team.White ? Team.Black : Team.White;

    this.events.emit("move-finished", { team: piece.team, from, to });

    return [true, null];
  }

  /**
   * @description
   * Checks if any team is in check.
   *
   * @returns The team that is in check.
   */
  inCheck() {
    const teams = [Team.White, Team.Black];

    for (const team of teams) {
      const king = this.board.pieces.find((piece) => piece.type === PieceType.King && piece.team === team);
      const enemies = this.board.pieces.filter((piece) => piece.team !== team);

      for (const piece of enemies) {
        for (const cell of piece.getLegalMoves()) {
          if (cell.equals(king.cell)) {
            this.attacker = piece;
            return team;
          }
        }
      }
    }

    return Team.None;
  }

  /* ---------- Getters ---------- */
  /**
   * @description
   * Checks if the team is in check.
   */
  get isCheck() {
    return this.state === "check";
  }

  /**
   * @description
   * Check if the game is in checkmate.
   */
  get isCheckmate() {
    return this.state === "checkmate";
  }

  /**
   * @description
   * Check if the game is in stalemate.
   */
  get isStalemate() {
    return this.state === "stalemate";
  }

  /**
   * @description
   * Check if the game is a draw.
   */
  get isDraw() {
    return this.state === "draw";
  }

  /**
   * @description
   * Check if the game is over.
   */
  get isGameOver() {
    return this.isCheckmate || this.isStalemate || this.isDraw;
  }

  /**
   * @description
   * Clones the current chess game state.
   *
   * @param chess Game instance to clone.
   * @returns Cloned game instance.
   */
  static clone(chess: Chess) {
    const clone = new Chess();

    clone.turn = chess.turn;
    clone.board = Board.clone(chess.board);
    clone.state = chess.state;

    return clone;
  }

  followInstructions(instructions: string, delay: number) {
    const moves = instructions.split(" ");

    const coords = (instruction: string) => {
      const [x, y] = instruction.split("");
      return new Vector2(x.charCodeAt(0) - 97, 8 - parseInt(y));
    };

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      if (move.length < 4) {
        console.warn(`Invalid move format: ${move}`);
        continue;
      }

      const [from, to] = [move.slice(0, 2), move.slice(2)].map((n) => this.board.getCellByNotation(n));
      if (!from) throw new Error("Invalid from cell " + from);
      if (!to) throw new Error("Invalid to cell " + to);

      setTimeout(() => {
        const piece = this.board.getPiece(from);
        if (!piece) return;

        console.log(`${piece.toString()} moves to ${move[2]}${move[3]} (${move})`);
        const [success] = this.move(from, to);

        console.log(success ? "success" : "failed");
      }, i * delay);
    }
  }
}

/* ---------- Enums ---------- */
export enum Team {
  None,
  White,
  Black,
}

export enum PieceType {
  /** ♙♟ */
  Pawn,

  /** ♖♜ */
  Rook,

  /** ♘♞ */
  Knight,

  /** ♗♝ */
  Bishop,

  /** ♕♛ */
  Queen,

  /** ♔♚ */
  King,
}

/* ---------- Exports ---------- */
export * from "./Piece";
export * from "./Cell";
export * from "./Board";
