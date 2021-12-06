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

  toString() {
    return `(${this.x}, ${this.y})`
  }
}

enum Orientation {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
  Diagonal = 'diagonal',
}

/**
 * Check if a number is inclusively between two other numbers, regardless of which is larger
 * ie. `between(2, 0, 3) === true` & `between(2, 3, 0) === true`
 */
function between(num: number, x1: number, x2: number): boolean {
  const min = Math.min(x1, x2)
  const max = Math.max(x1, x2)
  return min <= num && num <= max
}

class Line {
  public orientation: Orientation
  constructor(public from: Point, public to: Point) {
    if (from.x === to.x) {
      this.orientation = Orientation.Vertical
    } else if (from.y === to.y) {
      this.orientation = Orientation.Horizontal
    } else {
      this.orientation = Orientation.Diagonal
    }
  }

  hasPoint(point: Point): boolean {
    if (this.orientation === Orientation.Vertical) {
      return point.x === this.from.x && between(point.y, this.from.y, this.to.y)
    } else if (this.orientation === Orientation.Horizontal) {
      return point.y === this.from.y && between(point.x, this.from.x, this.to.x)
    } else {
      // Don't consider diagonal lines
      return false
    }
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

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const point = new Point(x, y)
        const matchedLines = lines.filter((l) => l.hasPoint(point)).length
        if (matchedLines > 0) {
          this.board[y][x] = matchedLines
        }
      }
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
