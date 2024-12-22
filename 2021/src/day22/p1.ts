import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const parsedInput = input.trim().split('\n')

type Action = 'on' | 'off'
type Bounds = [number, number]

class Point {
  constructor(public x: number, public y: number, public z: number) {}

  public inBounds(bounds: Bounds): boolean {
    return (
      this.x >= bounds[0] &&
      this.x <= bounds[1] &&
      this.y >= bounds[0] &&
      this.y <= bounds[1] &&
      this.z >= bounds[0] &&
      this.z <= bounds[1]
    )
  }

  public toString(): string {
    return `${this.x},${this.y},${this.z}`
  }
}

function boundsInBounds(bounds: Bounds, limitBounds: Bounds): boolean {
  return bounds[0] >= limitBounds[0] && bounds[1] <= limitBounds[1]
}

class Cuboid {
  constructor(
    public action: Action,
    public x: Bounds,
    public y: Bounds,
    public z: Bounds,
  ) {}

  public getPoints(bounds: Bounds): Point[] {
    const points: Point[] = []

    if (!boundsInBounds(this.x, bounds)) return []
    if (!boundsInBounds(this.y, bounds)) return []
    if (!boundsInBounds(this.z, bounds)) return []

    for (let x = this.x[0]; x <= this.x[1]; x++) {
      for (let y = this.y[0]; y <= this.y[1]; y++) {
        for (let z = this.z[0]; z <= this.z[1]; z++) {
          points.push(new Point(x, y, z))
        }
      }
    }

    return points
  }

  public toString(): string {
    return `${this.action} x=${this.x[0]}..${this.x[1]},y=${this.y[0]}..${this.y[1]},z=${this.z[0]}..${this.z[1]}`
  }

  public static fromString(str: string): Cuboid {
    const [action, coords] = str.split(' ')

    const [x, y, z] = coords.split(',').map((l) =>
      l
        .split('=')[1]
        .split('..')
        .map((num) => parseInt(num)),
    )

    return new Cuboid(action as Action, x as Bounds, y as Bounds, z as Bounds)
  }
}

class Reactor {
  private grid = new Map<string, Action>()

  constructor(public bounds: Bounds) {}

  public actionCubes(action: Action, cubes: Point[]): number {
    let actioned = 0

    cubes.forEach((cube) => {
      if (!cube.inBounds(this.bounds)) return

      const state = this.grid.get(cube.toString()) ?? 'off'
      if (state !== action) {
        actioned++
        this.grid.set(cube.toString(), action)
      }
    })

    return actioned
  }

  public getOnCubes(): string[] {
    return Array.from(this.grid.keys()).filter(
      (cube) => this.grid.get(cube) === 'on',
    )
  }
}

const cuboids = parsedInput.map((line) => Cuboid.fromString(line))
const reactor = new Reactor([-50, 50])

for (const cu of cuboids) {
  console.log(`Doing actions for ${cu}`)
  const points = cu.getPoints(reactor.bounds)
  const actions = reactor.actionCubes(cu.action, points)
  console.log(`${cu.action}'d ${actions} cubes\n`)
}

console.log(`${reactor.getOnCubes().length} cubes are on`)
