import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const octopi = input
  .trim()
  .split('\n')
  .map((line) => line.split('').map((c) => parseInt(c, 10)))

class Octopus {
  flashedThisStep = false
  constructor(
    public energy: number,
    public x: number,
    public y: number,
    public matrix: Matrix<Octopus>,
  ) {}

  nextStep() {
    this.flashedThisStep = false
    this.increaseEnergy()
  }

  increaseEnergy() {
    // If we flashed we can't gain energy through any means
    if (!this.flashedThisStep) {
      this.energy++
    }
  }

  checkForFlash(): boolean {
    if (this.energy > 9 && !this.flashedThisStep) {
      this.flash()
      return true
    }
    return false
  }

  flash() {
    // Can't flash twice a step
    if (this.flashedThisStep) return

    this.flashedThisStep = true

    // Increase energy of adjacent octopi
    this.matrix
      .getAdjacent(this.x, this.y)
      .forEach((oct) => oct.increaseEnergy())

    this.energy = 0
  }

  toString() {
    if (this.energy > 9) {
      return '\x1b[44m#\x1b[0m'
    }

    if (this.flashedThisStep) {
      return `\x1b[41m${this.energy}\x1b[0m`
    }

    return this.energy.toString()
  }
}

function notUndefined<T>(val: T | undefined): val is T {
  return val !== undefined
}

interface MatrixCell<T> {
  x: number
  y: number
  value: T
}

class Matrix<T> implements Iterable<MatrixCell<T>> {
  constructor(public values: T[][]) {}

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
    return this.values.map((row) => row.map((v) => v + '').join('')).join('\n')
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

// Terrible method of letting octopi have a reference to their containing matrix but
const octoMatrix = new Matrix<Octopus>([])
const octoObjs: Octopus[][] = []

for (let y = 0; y < octopi.length; y++) {
  octoObjs.push([])
  for (let x = 0; x < octopi[y].length; x++) {
    const value = octopi[y][x]
    octoObjs[y].push(new Octopus(value, x, y, octoMatrix))
  }
}

octoMatrix.values = octoObjs

const maxSteps = 999

console.log('Before any steps:')
console.log(octoMatrix.toString())

for (let step = 1; step <= maxSteps; step++) {
  console.log(`\nStep ${step.toString().padStart(2, ' ')}---`)

  // Run the step
  octoMatrix.forEach((cell) => cell.value.nextStep())
  // Log after increase, before flash check
  console.log(octoMatrix.toString(), '\n')

  // Keep checking for flashes until it resolves
  let flashes
  do {
    flashes = octoMatrix.map((cell) => cell.value.checkForFlash())
    // Log result after flash
    console.log(octoMatrix.toString(), '\n')
  } while (flashes.some((flash) => flash))

  const haveAllFlashed = octoMatrix
    .map((cell) => cell.value.flashedThisStep)
    .every((flashed) => flashed)
  if (haveAllFlashed) {
    console.log(`All octopi flashed at step ${step}!`)
    break
  }
}
