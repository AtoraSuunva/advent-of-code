import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const parsedInput = input.trim().split('\n')

type Bounds = [number, number]

function isBetween(num: number, min: number, max: number): boolean {
  return num >= min && num <= max
}

function overlappingBounds(bounds1: Bounds, bounds2: Bounds): boolean {
  return (
    isBetween(bounds1[0], ...bounds2) ||
    isBetween(bounds1[1], ...bounds2) ||
    isBetween(bounds2[0], ...bounds1) ||
    isBetween(bounds2[1], ...bounds1)
  )
}

class Cuboid {
  constructor(
    public sign: number,
    public x: Bounds,
    public y: Bounds,
    public z: Bounds,
  ) {}

  public get volume(): number {
    return (
      (this.x[1] - this.x[0] + 1) *
      (this.y[1] - this.y[0] + 1) *
      (this.z[1] - this.z[0] + 1)
    )
  }

  public getIntersection(other: Cuboid): Cuboid | null {
    if (
      !overlappingBounds(this.x, other.x) ||
      !overlappingBounds(this.y, other.y) ||
      !overlappingBounds(this.z, other.z)
    ) {
      return null
    }

    const x: Bounds = [
      Math.max(this.x[0], other.x[0]),
      Math.min(this.x[1], other.x[1]),
    ]
    const y: Bounds = [
      Math.max(this.y[0], other.y[0]),
      Math.min(this.y[1], other.y[1]),
    ]
    const z: Bounds = [
      Math.max(this.z[0], other.z[0]),
      Math.min(this.z[1], other.z[1]),
    ]

    return new Cuboid(0, x, y, z)
  }

  public toKey(): string {
    return `x=${this.x[0]}..${this.x[1]},y=${this.y[0]}..${this.y[1]},z=${this.z[0]}..${this.z[1]}`
  }

  public toString(): string {
    return `${this.sign} x=${this.x[0]}..${this.x[1]},y=${this.y[0]}..${this.y[1]},z=${this.z[0]}..${this.z[1]}`
  }

  public static fromString(str: string): Cuboid {
    const [action, coords] = str.split(' ')

    const [x, y, z] = coords.split(',').map((l) =>
      l
        .split('=')[1]
        .split('..')
        .map((num) => parseInt(num)),
    )

    return new Cuboid(
      action === 'on' ? 1 : -1,
      x as Bounds,
      y as Bounds,
      z as Bounds,
    )
  }
}

class Reactor {
  private cuboids = new Map<string, Cuboid>()

  public addCube(cube: Cuboid): void {
    const newCubes = new Map<string, Cuboid>()

    for (const c of this.cuboids.values()) {
      const intersect = c.getIntersection(cube)
      if (!intersect) continue
      const update = newCubes.get(intersect.toKey()) ?? intersect
      update.sign -= c.sign
      newCubes.set(intersect.toKey(), update)
    }

    if (cube.sign > 0) {
      const old = newCubes.get(cube.toKey())
      if (old) {
        old.sign += cube.sign
        newCubes.set(old.toKey(), old)
      } else {
        newCubes.set(cube.toKey(), cube)
      }
    }

    for (const [k, c] of newCubes) {
      const old = this.cuboids.get(k)
      if (old) {
        old.sign += c.sign
        this.cuboids.set(k, old)
      } else {
        this.cuboids.set(k, c)
      }
    }
  }

  public getOnCubes(): number {
    return Array.from(this.cuboids.values()).reduce(
      (acc, cube) => acc + cube.sign * cube.volume,
      0,
    )
  }
}

const cuboids = parsedInput.map((line) => Cuboid.fromString(line))
const reactor = new Reactor()

for (const cube of cuboids) {
  console.log(`Doing actions for ${cube}`)
  reactor.addCube(cube)
}

console.log(`${reactor.getOnCubes()} cubes are on`)
