import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const instructions = input.trim()

const [inDots, inFolds] = instructions.split('\n\n').map((s) => s.split('\n'))

class Dot {
  constructor(public x: number, public y: number) {}

  equals(other: Dot): boolean {
    return this.x === other.x && this.y === other.y
  }
}

enum Axis {
  X = 'x',
  Y = 'y',
}

interface Fold {
  axis: Axis
  location: number
}

const dots: Dot[] = inDots.map((s) => {
  const [x, y] = s.split(',')
  return new Dot(parseInt(x, 10), parseInt(y, 10))
})

const folds: Fold[] = inFolds.map((f) => {
  // Ignore the first two splits, it's just "fold along"
  const [, , coords] = f.split(' ')
  const [axis, location] = coords.split('=')
  return { axis: axis as Axis, location: parseInt(location, 10) }
})

class Paper {
  public width: number
  public height: number
  constructor(public dots: Dot[]) {
    this.width = dots.reduce((max, dot) => Math.max(max, dot.x), 0)
    this.height = dots.reduce((max, dot) => Math.max(max, dot.y), 0)
  }

  public fold(fold: Fold) {
    if (fold.axis === Axis.X) {
      this.foldX(fold.location)
    } else if (fold.axis === Axis.Y) {
      this.foldY(fold.location)
    }
  }

  private foldY(location: number) {
    this.height = location - 1

    const newDots = dots.map((dot) => {
      if (dot.y > location) {
        dot.y = location - (dot.y - location)
      }

      return dot
    })

    this.replaceDots(newDots)
  }

  private foldX(location: number) {
    this.width = location - 1

    const newDots = dots.map((dot) => {
      if (dot.x > location) {
        dot.x = location - (dot.x - location)
      }

      return dot
    })

    this.replaceDots(newDots)
  }

  private replaceDots(newDots: Dot[]) {
    const finalDots: Dot[] = []

    for (const dot of newDots) {
      if (!finalDots.some((d) => d.equals(dot))) {
        finalDots.push(dot)
      }
    }

    this.dots = finalDots
  }

  toString() {
    const grid = Array(this.height + 1)
      .fill(0)
      .map(() => Array(this.width + 1).fill('.'))

    this.dots.forEach((dot) => {
      grid[dot.y][dot.x] = '#'
    })

    return grid.map((row) => row.join('')).join('\n')
  }
}

const paper = new Paper(dots)
console.log(paper.toString())
console.log('--------------')
paper.fold(folds[0])
console.log(paper.toString())
console.log(`${paper.dots.length} dots`)
