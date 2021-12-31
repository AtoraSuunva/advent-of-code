import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const parsedInput = input.trim().split('\n\n')

function floatEquals(a: number, b: number, precision = 0.001): boolean {
  return Math.abs(a - b) < precision
}

function absoluteEquals(a: number, b: number): boolean {
  return floatEquals(Math.abs(a), Math.abs(b))
}

class Point {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
  ) {}

  public manhattanDistanceTo(other: Point): number {
    return (
      Math.abs(this.x - other.x) +
      Math.abs(this.y - other.y) +
      Math.abs(this.z - other.z)
    )
  }

  public absDeltaTo(other: Point): Point {
    return new Point(
      Math.abs(this.x - other.x),
      Math.abs(this.y - other.y),
      Math.abs(this.z - other.z),
    )
  }

  public deltaTo(other: Point): Point {
    return new Point(this.x - other.x, this.y - other.y, this.z - other.z)
  }

  public fingerprint(): string {
    return [
      Math.hypot(this.x, this.y, this.z).toFixed(5),
      Math.min(this.x, this.y, this.z),
      Math.max(this.x, this.y, this.z),
    ].join(',')
  }

  public clone(): Point {
    return new Point(this.x, this.y, this.z)
  }

  public toString(): string {
    return `(${this.x}, ${this.y}, ${this.z})`
  }
}

type CompareTuple = [string, number, number]

// Represents a single beacon
class Beacon {
  public readonly relatives: string[] = []

  constructor(
    public readonly scanner: Scanner,
    public position: Point,
    public readonly id: number,
  ) {}

  public alignTo(other: Beacon): void {
    const delta = this.position.absDeltaTo(other.position)
    const print = delta.fingerprint()
    this.relatives[other.id] = print
    other.relatives[this.id] = print
  }

  public compareTo(other: Beacon): CompareTuple[] {
    const result: CompareTuple[] = []
    for (const relative of this.relatives) {
      const index = other.relatives.indexOf(relative)

      if (index > -1) {
        result.push([
          other.relatives[index],
          this.relatives.indexOf(relative),
          index,
        ])
      }
    }

    return result
  }
}

interface ScannerCompareResult {
  there: Beacon
  here: Beacon
  intersection: CompareTuple[]
}

// Represents a scanner, with the beacons it has located
class Scanner {
  public beacons: Beacon[] = []
  public position: Point = new Point(0, 0, 0)

  constructor(public id: number) {}

  public addBeacon(point: Point): void {
    const newBeacon = new Beacon(this, point, this.beacons.length)

    for (const beacon of this.beacons) {
      beacon.alignTo(newBeacon)
    }

    this.beacons.push(newBeacon)
  }

  public compareTo(other: Scanner): ScannerCompareResult | null {
    for (const there of other.beacons) {
      for (const here of this.beacons) {
        const intersection = there.compareTo(here)
        if (intersection.length >= 11) {
          return {
            there,
            here,
            intersection,
          }
        }
      }
    }

    return null
  }

  public alignTo(other: Scanner, data: ScannerCompareResult): void {
    for (const [otherRelative, thisIndex, otherIndex] of data.intersection) {
      if (otherRelative.split(',')[1] === '0') {
        continue
      }

      const relativeHere = this.beacons[otherIndex]
      const deltaHere = data.here.position.deltaTo(relativeHere.position)
      const relativeThere = other.beacons[thisIndex]
      const deltaThere = data.there.position.deltaTo(relativeThere.position)

      if (
        absoluteEquals(deltaHere.x, deltaHere.y) ||
        absoluteEquals(deltaHere.z, deltaHere.y) ||
        absoluteEquals(deltaThere.x, deltaThere.z)
      ) {
        continue
      }

      const map = [0, 0, 0, 0, 0, 0, 0, 0, 0]

      if (deltaHere.x === deltaThere.x) map[0] = 1
      if (deltaHere.x === -deltaThere.x) map[0] = -1
      if (deltaHere.x === deltaThere.y) map[3] = 1
      if (deltaHere.x === -deltaThere.y) map[3] = -1
      if (deltaHere.x === deltaThere.z) map[6] = 1
      if (deltaHere.x === -deltaThere.z) map[6] = -1
      if (deltaHere.y === deltaThere.x) map[1] = 1
      if (deltaHere.y === -deltaThere.x) map[1] = -1
      if (deltaHere.y === deltaThere.y) map[4] = 1
      if (deltaHere.y === -deltaThere.y) map[4] = -1
      if (deltaHere.y === deltaThere.z) map[7] = 1
      if (deltaHere.y === -deltaThere.z) map[7] = -1
      if (deltaHere.z === deltaThere.x) map[2] = 1
      if (deltaHere.z === -deltaThere.x) map[2] = -1
      if (deltaHere.z === deltaThere.y) map[5] = 1
      if (deltaHere.z === -deltaThere.y) map[5] = -1
      if (deltaHere.z === deltaThere.z) map[8] = 1
      if (deltaHere.z === -deltaThere.z) map[8] = -1

      for (const beacon of other.beacons) {
        const old = beacon.position.clone()

        const newX = old.x * map[0] + old.y * map[3] + old.z * map[6]
        const newY = old.x * map[1] + old.y * map[4] + old.z * map[7]
        const newZ = old.x * map[2] + old.y * map[5] + old.z * map[8]

        beacon.position = new Point(newX, newY, newZ)
      }

      other.position = data.here.position.deltaTo(data.there.position)

      for (const beacon of other.beacons) {
        beacon.position = new Point(
          beacon.position.x + other.position.x,
          beacon.position.y + other.position.y,
          beacon.position.z + other.position.z,
        )
      }

      break
    }
  }

  public static fromInput(input: string): Scanner {
    const [inputId, ...inputBeacons] = input.split('\n')
    const id = parseInt(inputId.split(' ')[2])
    const scanner = new Scanner(id)

    for (const inputBeacon of inputBeacons) {
      const [x, y, z] = inputBeacon.split(',').map((val) => parseInt(val))
      const point = new Point(x, y, z ?? 0)
      scanner.addBeacon(point)
    }

    return scanner
  }
}

class Solver {
  constructor(public readonly scanners: Scanner[]) {}

  public align(): void {
    const locked = new Set<number>([0])
    this.scanners[0].position = new Point(0, 0, 0)

    while (locked.size < this.scanners.length) {
      for (let i = 0; i < this.scanners.length; i++) {
        for (let j = 0; j < this.scanners.length; j++) {
          if (i === j || !locked.has(i) || locked.has(j)) {
            continue
          }

          console.log(i, j, locked)
          const intersection = this.scanners[i].compareTo(this.scanners[j])

          if (!intersection) {
            continue
          }

          this.scanners[i].alignTo(this.scanners[j], intersection)
          locked.add(j)
        }
      }
    }
  }

  public getResult(): number {
    console.log('Aligning')
    this.align()
    console.log('Counting')
    let max = 0

    for (const here of this.scanners) {
      for (const there of this.scanners) {
        max = Math.max(max, here.position.manhattanDistanceTo(there.position))
      }
    }

    return max
  }
}

const scanners = parsedInput.map((l) => Scanner.fromInput(l))

const solver = new Solver(scanners)

console.log('Solving')
console.log(solver.getResult())
