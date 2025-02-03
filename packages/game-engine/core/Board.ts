/* ---------- Core ---------- */
import { Chess, PieceType, Team, Cell, Piece } from ".";

/* ---------- Packages ---------- */
import type { Vector2 } from "@chess/maths";

/**
 * @description
 * The board of the game.
 */
export class Board {
  game: Chess;
  cells: Cell[][];
  pieces: Piece[] = [];

  constructor(game: Chess) {
    this.cells = [];
    this.game = game;

    for (let i = 0; i < 8; i++) {
      this.cells[i] = [];

      for (let j = 0; j < 8; j++) {
        this.cells[i][j] = new Cell(i, j);
      }
    }

    const map = [
      "rnbqkbnr",
      "pppppppp",
      "        ",
      "        ",
      "        ",
      "        ",
      "PPPPPPPP",
      "RNBQKBNR",
    ];

    const pieces = {
      r: [PieceType.Rook, Team.Black],
      n: [PieceType.Knight, Team.Black],
      b: [PieceType.Bishop, Team.Black],
      q: [PieceType.Queen, Team.Black],
      k: [PieceType.King, Team.Black],
      p: [PieceType.Pawn, Team.Black],
      R: [PieceType.Rook, Team.White],
      N: [PieceType.Knight, Team.White],
      B: [PieceType.Bishop, Team.White],
      Q: [PieceType.Queen, Team.White],
      K: [PieceType.King, Team.White],
      P: [PieceType.Pawn, Team.White],
    } as const;

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const pieceCode = map[j][i];
        if (pieceCode === " ") continue;

        const [type, team] = pieces[pieceCode];
        const piece = new Piece({ team, type, board: this });
        const cell = this.at(i, j);

        piece.setCell(cell);
        this.pieces.push(piece);
      }
    }
  }

  /**
   * @description
   * Returns every uncaptured pieces of a team.
   *
   * @param team Team to get the pieces from.
   * @returns The uncaptured pieces of the team.
   */
  getTeamUncapturedPieces(team: Team) {
    if (team === Team.None) throw new Error("Invalid team");

    return this.pieces.filter((piece) => piece.team === team && !piece.captured);
  }

  /**
   * @description
   * Get the piece at the given location.
   *
   * @param {Vector2} location Location of the piece.
   * @returns {Piece|undefined} The piece at the location.
   */
  getPiece(location: Vector2): Piece | undefined {
    if (!location) return undefined;

    return this.pieces.find((piece) => {
      return !piece.captured && piece.cell.equals(this.at(location.x, location.y));
    });
  }

  /**
   * @description
   * Get the cell at the given a bidimensional vector.
   *
   * @param location Location of the cell.
   * @returns The cell at the location.
   */
  getCell(location: Vector2): Cell | undefined {
    if (!location) return undefined;

    return this.at(location.x, location.y);
  }

  /**
   * @description
   * Get the cell by its algebraic notation.
   *
   * @param notation The algebraic notation of the cell.
   * @returns The cell at the location.
   */
  getCellByNotation(notation: string): Cell | undefined {
    for (const cell of this.cells.flat()) {
      if (cell.notation === notation.toLowerCase()) return cell;
    }
  }

  /**
   * @description
   * Get the piece by its coordinates.
   *
   * @param x The X coordinate.
   * @param y The Y coordinate.
   *
   * @returns The cell at the location.
   */
  at(x: number, y: number) {
    return this.cells[x]?.[y];
  }

  /**
   * @description
   * Removes a piece from the board.
   *
   * @param piece The piece to remove.
   */
  remove(piece: Piece) {
    this.pieces = this.pieces.filter((p) => p !== piece);
  }

  /**
   * @description
   * Clones the board.
   *
   * @param board The board to clone.
   * @returns The cloned board.
   */
  static clone(board: Board) {
    const clone = new Board(board.game);

    for (const piece of board.pieces) {
      const clonePiece = Piece.clone(piece);
      clone.pieces.push(clonePiece);
    }

    return clone;
  }
}
