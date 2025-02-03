/* ---------- Core ---------- */
import type { Team, Cell, Piece } from ".";

/* ---------- Packages ---------- */
import type { Vector2 } from "@chess/maths";

/* ---------- Constants ---------- */
const events = [
  "move",
  "move-finished",
  "capture",
  "checkmate",
  "stalemate",
  "check",
  "promotion",
  "promotion-available",
] as const;

/* ---------- Types ---------- */
type EventName = (typeof events)[number];
type Callback<Props> = (props: Props) => void;
type EventMap = {
  move: MoveProps;
  "move-finished": MoveProps;
  capture: CaptureProps;
  checkmate: CheckMateProps;
  check: CheckProps;
  stalemate: {};
  promotion: PromotionProps;
  "promotion-available": PromotionAvailableProps;
};

/**
 * @description
 * A class for managing callback-based events.
 */
export class Events {
  /**
   * @private
   * @description
   * The map of registered events and their callbacks.
   */
  private callbacks: Map<EventName, Set<Callback<EventMap[EventName]>>>;

  constructor() {
    this.callbacks = new Map();

    for (const name of events) {
      this.callbacks.set(name, new Set());
    }
  }

  /**
   * @description
   * Registers a callback for an event.
   *
   * @param name Event name
   * @param callback Callback to run when the event is emitted
   */
  on<Event extends EventName>(name: Event, callback: Callback<EventMap[Event]>): void {
    const event = this.callbacks.get(name);
    if (!event) return;

    event.add(callback);
  }

  /**
   * @description
   * Registers a callback for an event that runs only once.
   *
   * @param name Event name
   * @param callback Callback to run when the event is emitted
   */
  once<Event extends EventName>(name: Event, callback: Callback<EventMap[Event]>): void {
    const wrapper: Callback<EventMap[Event]> = (props) => {
      callback(props);
      this.off(name, wrapper);
    };

    this.on(name, wrapper);
  }

  /**
   * @description
   * Emits an event, running all registered callbacks.
   *
   * @param name Event name
   * @param data Event data
   */
  emit<Event extends EventName>(name: Event, data: EventMap[Event]) {
    const event = this.callbacks.get(name);
    if (!event) return;

    for (const callback of event) {
      callback(data);
    }
  }

  /**
   * @description
   * Removes a callback from an event.
   *
   * @param name Event name
   * @param callback Callback to remove
   */
  off<Event extends EventName>(name: Event, callback: Callback<EventMap[Event]>): void {
    const event = this.callbacks.get(name);
    if (!event) return;

    event.delete(callback);
  }

  /**
   * @description
   * Removes all callbacks.
   *
   * @param name Optional event name
   */
  clear<Event extends EventName>(name?: Event): void {
    if (!name) {
      this.callbacks.clear();
      for (const name of events) {
        this.callbacks.set(name, new Set());
      }

      return;
    }

    const event = this.callbacks.get(name);
    if (!event) return;

    event.clear();
  }
}

/* ---------- Interfaces ---------- */
interface MoveProps {
  /**
   * @description
   * The team that made the move.
   */
  team: Team;

  /**
   * @description
   * The cell the piece moved from.
   */
  from: Vector2;

  /**
   * @description
   * The cell the piece moved to.
   */
  to: Vector2;
}

interface CaptureProps {
  /**
   * @description
   * Captured piece
   */
  piece: Piece;

  /**
   * @description
   * The team that captured the piece.
   */
  team: Team;

  /**
   * @description
   * The cell the piece was captured at.
   */
  cell: Cell;
}

interface CheckMateProps {
  /**
   * @description
   * The team that won.
   */
  team: Team;
}

interface CheckProps {
  /**
   * @description
   * The team that is in check.
   */
  team: Team;
}

interface PromotionProps {
  /**
   * @description
   * The team that is promoting.
   */
  team: Team;

  /**
   * @description
   * The cell the piece is promoting at.
   */
  cell: Cell;

  /**
   * @description
   * The type the piece is promoting to.
   */
  type: Piece["type"];
}

interface PromotionAvailableProps {
  /**
   * @description
   * The team that is promoting.
   */
  team: Team;

  /**
   * @description
   * The cell the piece is promoting at.
   */
  cell: Cell;
}
