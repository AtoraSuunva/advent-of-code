import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const map = input
  .trim()
  .split('\n')
  .map((l) => l.split('').map((v) => parseInt(v, 10)))

function notUndefined<T>(val: T | undefined): val is T {
  return val !== undefined
}

class MapWithDefault<K, V> extends Map<K, V> {
  constructor(
    public defaultValue: V,
    entries?: readonly (readonly [K, V])[] | null,
  ) {
    super(entries)
  }

  override get(key: K): V {
    return super.has(key) ? super.get(key)! : this.defaultValue
  }
}

interface Coords {
  x: number
  y: number
}

interface MatrixCell<T> extends Coords {
  value: T
}

class Matrix<T> implements Iterable<MatrixCell<T>> {
  readonly #cells: MatrixCell<T>[][] = []
  readonly #values: T[][]
  public readonly height: number
  public readonly width: number

  constructor(values: T[][]) {
    this.#values = values
    this.height = values.length
    this.width = values[0].length

    for (let y = 0; y < this.#values.length; y++) {
      this.#cells.push([])
      for (let x = 0; x < this.#values[y].length; x++) {
        if (this.#values[y].length !== this.width) {
          throw new Error(
            `Row ${y} has different width than others, invalid matrix`,
          )
        }

        const value = this.#values[y][x]
        const cell = { x, y, value }
        Object.freeze(cell)
        this.#cells[y].push(cell)
      }
    }
  }

  get(x: number, y: number): MatrixCell<T> | undefined {
    return this.#cells[y]?.[x]
  }

  getDirectlyAdjacent(x: number, y: number): MatrixCell<T>[] {
    return [
      this.get(x, y - 1),
      this.get(x - 1, y),
      this.get(x + 1, y),
      this.get(x, y + 1),
    ].filter(notUndefined)
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
    ].filter(notUndefined)
  }

  // These heuristics are not every good (they don't consider risk) but work
  #heuristic(a: Coords, b: Coords): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
  }

  #getLowestFScore(
    openSet: Set<MatrixCell<T>>,
    fScore: MapWithDefault<MatrixCell<T>, number>,
  ): MatrixCell<T> {
    let lowest: MatrixCell<T> | undefined
    for (const cell of openSet) {
      if (lowest === undefined || fScore.get(cell) < fScore.get(lowest)) {
        lowest = cell
      }
    }
    return lowest!
  }

  #reconstructPath(
    cameFrom: Map<MatrixCell<T>, MatrixCell<T>>,
    current: MatrixCell<T>,
  ): MatrixCell<T>[] {
    const totalPath: MatrixCell<T>[] = [current]
    while (cameFrom.has(current)) {
      current = cameFrom.get(current)!
      totalPath.unshift(current)
    }
    return totalPath
  }

  aStar(start: Coords, goal: Coords): MatrixCell<T>[] | null {
    const startNode = this.get(start.x, start.y)
    if (startNode === undefined)
      throw new Error(`Start not in matrix: ${start}`)
    const goalNode = this.get(goal.x, goal.y)
    if (goalNode === undefined) throw new Error(`Goal not in matrix: ${goal}`)

    // Using a min-heap or priority queue here would be faster, but JS doesn't include one in the standard library
    // The solution runs in acceptable time anyhow, and I do not want to implment one to save a few seconds
    const openSet = new Set<MatrixCell<T>>([startNode])
    const cameFrom = new Map<MatrixCell<T>, MatrixCell<T>>()
    const gScore = new MapWithDefault<MatrixCell<T>, number>(Infinity)
    gScore.set(startNode, 0)
    const fScore = new MapWithDefault<MatrixCell<T>, number>(Infinity)
    fScore.set(startNode, this.#heuristic(start, goal))

    while (openSet.size > 0) {
      // Slow, can be faster using a better data structure, see above
      const current = this.#getLowestFScore(openSet, fScore)
      if (current === goalNode) {
        return this.#reconstructPath(cameFrom, current)
      }

      openSet.delete(current)
      for (const neighbor of this.getDirectlyAdjacent(current.x, current.y)) {
        const tentativeGScore = gScore.get(current) + Number(neighbor.value)
        if (tentativeGScore < gScore.get(neighbor)) {
          cameFrom.set(neighbor, current)
          gScore.set(neighbor, tentativeGScore)
          fScore.set(
            neighbor,
            tentativeGScore + this.#heuristic(neighbor, goal),
          )
          if (!openSet.has(neighbor)) {
            openSet.add(neighbor)
          }
        }
      }
    }

    // Goal was never reached
    return null
  }

  forEach(callback: (cell: MatrixCell<T>) => void) {
    for (const cell of this) {
      callback(cell)
    }
  }

  map<U>(callback: (cell: MatrixCell<T>) => U) {
    const values: U[] = []
    for (const cell of this) {
      values.push(callback(cell))
    }
    return values
  }

  toString() {
    return this.#values
      .map((row) => row.map((v) => String(v)).join(''))
      .join('\n')
  }

  *[Symbol.iterator](): Iterator<MatrixCell<T>, void, undefined> {
    for (const row of this.#cells) {
      for (const cell of row) {
        yield cell
      }
    }
  }
}

// The actual map is scaled 5 times in each direction, the risks increasing by 1 each time it scales
// (Wrapping to 1 when risk > 9)
// So we need to scale the map by 5 to get the actual map (ie. 10x10 map => 50x50 map)

const SCALE_BY = 5
const actualMap: number[][] = []

// Multiply map.length by the scale factor to get enough height
for (let y = 0; y < map.length * SCALE_BY; y++) {
  actualMap[y] = []
  // Copy over the values SCALE_BY times to get enough width
  // (while also increasing the risk)
  for (let scale = 0; scale < SCALE_BY; scale++) {
    const mapStep = Math.floor(y / map.length)
    actualMap[y].push(
      ...Array.from(map[y % map.length]).map((v) => {
        const newValue = v + mapStep + scale
        return newValue > 9 ? newValue % 9 : newValue
      }),
    )
  }
}

const matrix = new Matrix(actualMap)
// Top-left to bottom-right
const path = matrix.aStar(
  { x: 0, y: 0 },
  { x: matrix.width - 1, y: matrix.height - 1 },
)

if (path === null) {
  throw new Error('No path found')
}

const risk =
  path.reduce((acc, cell) => acc + Number(cell.value), 0) - path.shift()!.value

console.log(risk)
