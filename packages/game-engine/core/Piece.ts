/* ---------- Core ---------- */
import { PieceType, Team, type Cell, type Board } from ".";

/* ---------- Packages ---------- */
import { type Coordinate2D, Vector2 } from "@chess/maths";

/* ---------- Interfaces ---------- */
interface PieceProps {
  team: Team;
  type: PieceType;
  board: Board;
}

/**
 * @description
 * A piece on the board.
 */
export class Piece {
  team: Team;
  type: PieceType;
  cell: Cell;
  board: Board;
  captured: boolean;

  constructor({ board, team, type }: PieceProps) {
    this.team = team;
    this.type = type;
    this.board = board;
    this.captured = false;
  }

  setCell(cell: Cell) {
    if (this.captured) return;
    this.cell = cell;
  }

  promote(type: PieceType) {
    this.type = type;

    this.board.game.events.emit("promotion", {
      team: this.team,
      cell: this.cell,
      type,
    });
  }

  getLegalMoves() {
    if (this.captured) return [];
    const moves: Cell[] = [];

    switch (this.type) {
      case PieceType.Pawn:
        moves.push(...this.getPawnMoves());
        break;
      case PieceType.Rook:
        moves.push(...this.getRookMoves());
        break;
      case PieceType.Knight:
        moves.push(...this.getKnightMoves());
        break;
      case PieceType.Bishop:
        moves.push(...this.getBishopMoves());
        break;
      case PieceType.Queen:
        moves.push(...this.getQueenMoves());
        break;
      case PieceType.King:
        moves.push(...this.getKingMoves());
        break;
    }

    return moves;
  }

  private moveFilter(cell?: Cell) {
    if (!cell) return false;

    const piece = this.board.getPiece(cell);
    if (!piece) return true;

    return piece.team !== this.team;
  }

  private getNeighbor({ x, y }: Coordinate2D) {
    return this.cell.add(Vector2.fromObject({ x, y }));
  }

  private getPawnMoves() {
    const moves: Cell[] = [];

    /** Tiles ahead */
    const tilesAhead = (() => {
      const cells: Cell[] = [];
      const direction = this.team === Team.White ? -1 : 1;
      const firstMove = this.team === Team.White ? this.cell.y === 6 : this.cell.y === 1;

      if (firstMove) {
        if (!this.board.getPiece(this.getNeighbor({ x: 0, y: direction }))) {
          cells.push(this.getNeighbor({ x: 0, y: 2 * direction }));
        }
      }

      cells.push(this.getNeighbor({ x: 0, y: direction }));

      return cells.filter((cell) => cell && !this.board.getPiece(cell));
    })();

    /** Diagonal tiles if contains an enemy */
    const attacks = (() => {
      const cells: Cell[] = [];

      if (this.team === Team.White) {
        cells.push(...[this.getNeighbor({ x: 1, y: -1 }), this.getNeighbor({ x: -1, y: -1 })]);
      } else {
        cells.push(...[this.getNeighbor({ x: 1, y: 1 }), this.getNeighbor({ x: -1, y: 1 })]);
      }

      return cells.filter(
        (cell) => cell && this.board.getPiece(cell) && this.board.getPiece(cell).team !== this.team,
      );
    })();

    moves.push(...attacks, ...tilesAhead);

    return moves.filter((cell) => this.moveFilter(cell));
  }

  private getRookMoves() {
    const moves: Cell[] = [];

    const busyDirections = {
      left: false,
      right: false,
      up: false,
      down: false,
    };

    for (let i = 1; i < 8; i++) {
      const directions = {
        right: !busyDirections.right ? this.getNeighbor({ x: i, y: 0 }) : null,
        left: !busyDirections.left ? this.getNeighbor({ x: -i, y: 0 }) : null,
        up: !busyDirections.up ? this.getNeighbor({ x: 0, y: -i }) : null,
        down: !busyDirections.down ? this.getNeighbor({ x: 0, y: i }) : null,
      };

      for (const [direction, cell] of Object.entries(directions)) {
        if (cell) {
          const piece = this.board.getPiece(cell);
          if (piece) {
            // Stop further exploration
            busyDirections[direction] = true;

            if (piece.team === this.team) continue;
          }

          moves.push(cell);
        } else {
          // Out of bounds or blocked
          busyDirections[direction] = true;
        }
      }

      // Exit early if all directions are blocked
      if (Object.values(busyDirections).every((blocked) => blocked)) break;
    }

    return moves.filter((cell) => cell);
  }

  private getKnightMoves() {
    const moves: Cell[] = [];

    moves.push(this.getNeighbor({ x: 1, y: 2 }));
    moves.push(this.getNeighbor({ x: 2, y: 1 }));
    moves.push(this.getNeighbor({ x: -1, y: 2 }));
    moves.push(this.getNeighbor({ x: -2, y: 1 }));
    moves.push(this.getNeighbor({ x: 1, y: -2 }));
    moves.push(this.getNeighbor({ x: 2, y: -1 }));
    moves.push(this.getNeighbor({ x: -1, y: -2 }));
    moves.push(this.getNeighbor({ x: -2, y: -1 }));

    return moves.filter((cell) => this.moveFilter(cell));
  }

  private getBishopMoves() {
    const moves: Cell[] = [];

    const busyDirections = {
      topLeft: false,
      topRight: false,
      bottomLeft: false,
      bottomRight: false,
    };

    for (let i = 1; i < 8; i++) {
      const directions = {
        topLeft: !busyDirections.topLeft ? this.getNeighbor({ x: -i, y: -i }) : null,
        topRight: !busyDirections.topRight ? this.getNeighbor({ x: i, y: -i }) : null,
        bottomRight: !busyDirections.bottomRight ? this.getNeighbor({ x: i, y: i }) : null,
        bottomLeft: !busyDirections.bottomLeft ? this.getNeighbor({ x: -i, y: i }) : null,
      };

      for (const [direction, cell] of Object.entries(directions)) {
        if (cell) {
          const piece = this.board.getPiece(cell);
          if (piece) {
            // Stop further exploration
            busyDirections[direction] = true;

            if (piece.team === this.team) continue;
          }

          moves.push(cell);
        } else {
          // Out of bounds or blocked
          busyDirections[direction] = true;
        }
      }

      // Exit early if all directions are blocked
      if (Object.values(busyDirections).every((blocked) => blocked)) break;
    }

    return moves.filter((cell) => this.moveFilter(cell));
  }

  private getQueenMoves() {
    return this.getRookMoves()
      .concat(this.getBishopMoves())
      .filter((cell) => this.moveFilter(cell));
  }

  private getKingMoves() {
    const moves: Cell[] = [];

    moves.push(this.getNeighbor({ x: 1, y: 0 }));
    moves.push(this.getNeighbor({ x: 1, y: 1 }));
    moves.push(this.getNeighbor({ x: 0, y: 1 }));
    moves.push(this.getNeighbor({ x: -1, y: 1 }));
    moves.push(this.getNeighbor({ x: -1, y: 0 }));
    moves.push(this.getNeighbor({ x: -1, y: -1 }));
    moves.push(this.getNeighbor({ x: 0, y: -1 }));
    moves.push(this.getNeighbor({ x: 1, y: -1 }));

    return moves.filter((cell) => this.moveFilter(cell));
  }

  /**
   * @description
   * Returns whether moving this piece to the given cell removes the check.
   *
   * @param to The cell to move to.
   * @returns Indicator whether the check is removed.
   */
  removesCheckOn(to: Vector2) {
    const { attacker } = this.board.game;
    /** If the cell we're moving to is the attacker cell */
    const removesAttacker = attacker.cell.equals(to);
    if (removesAttacker) {
      // If the attacker gets eaten, would it still be in check?
      attacker.captured = true;
      attacker.setCell(this.board.at(-1, -1));
      const removes = !this.wouldBeInCheck(attacker.cell);
      attacker.setCell(this.board.getCell(to));
      attacker.captured = false;

      return removes;
    }

    const from = this.cell;
    this.setCell(this.board.getCell(to));
    const teamInCheck = this.board.game.inCheck();
    this.setCell(from);

    return teamInCheck === Team.None;
  }

  /**
   * @description
   * Returns whether moving this piece to the given cell would put the team in check.
   *
   * @param on The cell to move to.
   * @returns Indicator whether the team would be in check.
   */
  wouldBeInCheck(on: Vector2) {
    const from = this.cell;
    const to = this.board.getCell(on);

    this.setCell(to);
    const teamInCheck = this.board.game.inCheck();
    this.setCell(from);

    return teamInCheck === this.team;
  }

  toString() {
    const type = PieceType[this.type].toLowerCase();
    const team = Team[this.team].toLowerCase();

    return `${team} ${type}`;
  }

  static clone(piece: Piece) {
    const clone = new Piece({
      team: piece.team,
      type: piece.type,
      board: piece.board,
    });

    clone.setCell(piece.cell);
    return clone;
  }
}
