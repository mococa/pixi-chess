/* ---------- Packages ---------- */
import { Vector2 } from "@chess/maths";

/**
 * @description
 * A cell on the board.
 *
 * @extends Vector2
 */
export class Cell extends Vector2 {
  constructor(x: number, y: number) {
    super(x, y);
  }

  /**
   * @description
   * Get the algebraic notation of the cell.
   */
  get notation() {
    return `${String.fromCharCode(this.x + 97)}${8 - this.y}`;
  }

  /**
   * @description
   * Check if the cell is on the board.
   */
  get isOnBoard() {
    return this.x >= 0 && this.x < 8 && this.y >= 0 && this.y < 8;
  }

  add(other: Vector2) {
    const cell = new Cell(this.x + other.x, this.y + other.y);
    if (cell.isOnBoard) return cell;

    return null;
  }
}
