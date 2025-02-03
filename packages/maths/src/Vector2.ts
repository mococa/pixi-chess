import { Coordinate2D } from "./Coord2D";

export class Vector2 extends Coordinate2D {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    super(x, y);
  }

  add(vector: Vector2) {
    return new Vector2(this.x + vector.x, this.y + vector.y);
  }

  subtract(vector: Vector2) {
    return new Vector2(this.x - vector.x, this.y - vector.y);
  }

  multiply(scalar: number) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  divide(scalar: number) {
    return new Vector2(this.x / scalar, this.y / scalar);
  }

  equals(vector: Vector2) {
    return this.x === vector.x && this.y === vector.y;
  }

  set(vector: Vector2) {
    this.x = vector.x;
    this.y = vector.y;
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  get normalized() {
    return this.divide(this.length);
  }

  get angle() {
    return Math.atan2(this.y, this.x);
  }

  static get zero() {
    return new Vector2(0, 0);
  }

  static get one() {
    return new Vector2(1, 1);
  }

  static get up() {
    return new Vector2(0, 1);
  }

  static get down() {
    return new Vector2(0, -1);
  }

  static get left() {
    return new Vector2(-1, 0);
  }

  static get right() {
    return new Vector2(1, 0);
  }

  static fromAngle(angle: number) {
    return new Vector2(Math.cos(angle), Math.sin(angle));
  }

  static distance(a: Vector2, b: Vector2) {
    return a.subtract(b).length;
  }

  static dot(a: Vector2, b: Vector2) {
    return a.x * b.x + a.y * b.y;
  }

  static lerp(a: Vector2, b: Vector2, t: number) {
    return a.add(b.subtract(a).multiply(t));
  }

  static moveTowards(current: Vector2, target: Vector2, maxDistanceDelta: number) {
    const a = target.subtract(current);
    const magnitude = a.length;
    if (magnitude <= maxDistanceDelta || magnitude === 0) {
      return target;
    }
    return current.add(a.divide(magnitude).multiply(maxDistanceDelta));
  }

  static angleBetween(from: Vector2, to: Vector2) {
    return Math.acos(Vector2.dot(from.normalized, to.normalized));
  }

  static angleTo(from: Vector2, to: Vector2) {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }

  static rotate(vector: Vector2, angle: number) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector2(vector.x * cos - vector.y * sin, vector.x * sin + vector.y * cos);
  }

  static min(a: Vector2, b: Vector2) {
    return new Vector2(Math.min(a.x, b.x), Math.min(a.y, b.y));
  }

  static max(a: Vector2, b: Vector2) {
    return new Vector2(Math.max(a.x, b.x), Math.max(a.y, b.y));
  }

  static clamp(vector: Vector2, min: Vector2, max: Vector2) {
    return Vector2.min(Vector2.max(vector, min), max);
  }

  static random(min: Vector2, max: Vector2) {
    return new Vector2(Math.random() * (max.x - min.x) + min.x, Math.random() * (max.y - min.y) + min.y);
  }

  static from(value: number) {
    return new Vector2(value, value);
  }

  static fromArray(array: number[]) {
    return new Vector2(array[0], array[1]);
  }

  static fromObject(obj: { x: number; y: number }) {
    return new Vector2(obj.x, obj.y);
  }
}
