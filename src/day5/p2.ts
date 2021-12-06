import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const vents = input.trim().split('\n')
// Lines in the form:
// x1, y2 -> x2, y2

class Point {
  constructor(public x: number, public y: number) {}

  equals(other: Point) {
    return this.x === other.x && this.y === other.y
  }

  copy() {
    return new Point(this.x, this.y)
  }

  toString() {
    return `(${this.x}, ${this.y})`
  }
}

enum Orientation {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
  Diagonal = 'diagonal',
}

class Line {
  public orientation: Orientation
  // The points this line overlaps, to optimize searching
  public points: Point[] = []

  constructor(public from: Point, public to: Point) {
    if (from.x === to.x) {
      this.orientation = Orientation.Vertical
    } else if (from.y === to.y) {
      this.orientation = Orientation.Horizontal
    } else {
      this.orientation = Orientation.Diagonal
    }
    this.generatePoints()
  }

  private generatePoints() {
    const check = this.from.copy()

    do {
      this.points.push(check.copy())
      if (
        this.orientation === Orientation.Horizontal ||
        this.orientation === Orientation.Diagonal
      ) {
        check.x += check.x < this.to.x ? 1 : -1
      }
      if (
        this.orientation === Orientation.Vertical ||
        this.orientation === Orientation.Diagonal
      ) {
        check.y += check.y < this.to.y ? 1 : -1
      }
    } while (!check.equals(this.to))

    this.points.push(this.to.copy())
  }

  hasPoint(point: Point): boolean {
    return this.points.some((p) => p.equals(point))
  }

  equals(other: Line) {
    return this.from.equals(other.from) && this.to.equals(other.to)
  }

  toString() {
    return `${this.from.x},${this.from.y} -> ${this.to.x},${this.to.y}`
  }

  static fromString(str: string) {
    const [from, to] = str.split('->')
    const [x1, y1] = from.split(',').map((p) => parseInt(p, 10))
    const [x2, y2] = to.split(',').map((p) => parseInt(p, 10))
    return new Line(new Point(x1, y1), new Point(x2, y2))
  }
}

class Board {
  public width: number
  public height: number
  public board: number[][]

  constructor(public lines: Line[]) {
    this.width = Math.max(...lines.flatMap((l) => [l.to.x, l.from.x])) + 1
    this.height = Math.max(...lines.flatMap((l) => [l.to.y, l.from.y])) + 1

    this.board = new Array(this.height)
      .fill(0)
      .map(() => new Array(this.width).fill(0))

    const points = this.lines.flatMap((line) => line.points)

    for (const point of points) {
      this.board[point.y][point.x]++
    }
  }

  getPointsWithOverlaps(minOverlaps = 1): Point[] {
    const points = []
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.board[y][x] >= minOverlaps) {
          points.push(new Point(x, y))
        }
      }
    }
    return points
  }

  toString() {
    return this.board
      .map((row) => row.map((n) => (n === 0 ? '.' : n)).join(''))
      .join('\n')
  }
}

const lines = vents.map((line) => Line.fromString(line))
const board = new Board(lines)
const overlaps = board.getPointsWithOverlaps(2).length

console.log(`Overlaps: ${overlaps}`)
