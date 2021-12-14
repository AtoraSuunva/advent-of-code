import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const heightmap = input
  .trim()
  .split('\n')
  .map((row) => row.split('').map((num) => parseInt(num, 10)))

function isDefined<T>(val: T | undefined): val is T {
  return val !== undefined
}

interface MatrixCell<T> {
  x: number
  y: number
  value: T
}

class Matrix<T> implements Iterable<MatrixCell<T>> {
  #cells: MatrixCell<T>[][] = []

  constructor(values: T[][]) {
    // Populate cells
    for (let y = 0; y < values.length; y++) {
      const curLine: MatrixCell<T>[] = []
      for (let x = 0; x < values[y].length; x++) {
        const value = values[y][x]
        curLine.push({ x, y, value })
      }
      this.#cells.push(curLine)
    }
  }

  get(x: number, y: number): MatrixCell<T> | undefined {
    return this.#cells[y]?.[x]
  }

  getAdjacent(x: number, y: number): MatrixCell<T>[] {
    return [
      this.get(x - 1, y - 1),
      this.get(x, y - 1),
      this.get(x + 1, y - 1),
      this.get(x - 1, y),
      this.get(x + 1, y),
      this.get(x - 1, y + 1),
      this.get(x, y + 1),
      this.get(x + 1, y + 1),
    ].filter(isDefined)
  }

  getDirectlyAdjacent(x: number, y: number): MatrixCell<T>[] {
    return [
      this.get(x, y - 1),
      this.get(x - 1, y),
      this.get(x + 1, y),
      this.get(x, y + 1),
    ].filter(isDefined)
  }

  *[Symbol.iterator](): Iterator<MatrixCell<T>, void, undefined> {
    for (let y = 0; y < this.#cells.length; y++) {
      for (let x = 0; x < this.#cells[y].length; x++) {
        yield this.#cells[y][x]
      }
    }
  }
}

function isLowest(
  cell: MatrixCell<number>,
  others: MatrixCell<number>[],
): boolean {
  return others.every((o) => o.value >= cell.value)
}

const matrix = new Matrix(heightmap)
const lowests: MatrixCell<number>[] = []

for (const point of matrix) {
  if (isLowest(point, matrix.getAdjacent(point.x, point.y))) {
    lowests.push(point)
  }
}

console.log(lowests)

function getBasin(
  matrix: Matrix<number>,
  first: MatrixCell<number>,
): MatrixCell<number>[] {
  // All the cells in the basin
  const basin: MatrixCell<number>[] = [first]
  // All the cells we have left to search
  const queue: MatrixCell<number>[] = [first]

  let cell: MatrixCell<number> | undefined

  // eslint-disable-next-line no-cond-assign
  while ((cell = queue.shift())) {
    for (const adjacent of matrix.getDirectlyAdjacent(cell.x, cell.y)) {
      if (adjacent.value !== 9 && !basin.includes(adjacent)) {
        basin.push(adjacent)
        queue.push(adjacent)
      }
    }
  }

  return basin
}

const basins = lowests.map((lowest) => getBasin(matrix, lowest))
const result = basins
  .map((b) => b.length)
  .sort((a, b) => b - a)
  .slice(0, 3)
  .reduce((a, b) => a * b, 1)

console.log(`Result: ${result}`)
