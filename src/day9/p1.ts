import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const heightmap = input
  .trim()
  .split('\n')
  .map((row) => row.split('').map((num) => parseInt(num, 10)))

function notUndefined<T>(val: T | undefined): val is T {
  return val !== undefined
}

interface MatrixCell<T> {
  x: number
  y: number
  value: T
}

class Matrix<T> implements Iterable<MatrixCell<T>> {
  values: T[][]
  constructor(values: T[][]) {
    this.values = values
  }

  get(x: number, y: number): T | undefined {
    return this.values[y]?.[x]
  }

  getAdjacent(x: number, y: number): T[] {
    return [
      this.get(x - 1, y - 1),
      this.get(x, y - 1),
      this.get(x + 1, y - 1),
      this.get(x - 1, y),
      this.get(x + 1, y),
      this.get(x - 1, y + 1),
      this.get(x, y + 1),
      this.get(x + 1, y + 1),
    ].filter(notUndefined)
  }

  *[Symbol.iterator](): Iterator<MatrixCell<T>, void, undefined> {
    for (let y = 0; y < this.values.length; y++) {
      for (let x = 0; x < this.values[y].length; x++) {
        const value = this.values[y][x]
        yield { x, y, value }
      }
    }
  }
}

function isLowest(num: number, values: number[]): boolean {
  return values.every((val) => val >= num)
}

const matrix = new Matrix(heightmap)
const lowests: number[] = []

for (const point of matrix) {
  if (isLowest(point.value, matrix.getAdjacent(point.x, point.y))) {
    lowests.push(point.value)
  }
}

console.log(lowests.map((v) => v + 1).reduce((a, b) => a + b, 0))
