import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const [areaX, areaY] = input
  .trim()
  .split(':')[1]
  .trim()
  .split(', ')
  .map((v) =>
    v
      .split('=')[1]
      .split('..')
      .map((n) => parseInt(n, 10)),
  )

interface Area {
  x: [number, number]
  y: [number, number]
}

interface Velocity {
  x: number
  y: number
}

function between(num: number, x1: number, x2: number): boolean {
  const min = Math.min(x1, x2)
  const max = Math.max(x1, x2)
  return min <= num && num <= max
}

class Probe {
  public velocity: Velocity
  public highestY: number

  constructor(public x: number, public y: number, velocity: Velocity) {
    this.highestY = y
    this.velocity = Object.assign({}, velocity)
  }

  step() {
    this.x += this.velocity.x
    this.y += this.velocity.y
    if (this.y > this.highestY) this.highestY = this.y
    this.velocity.x -= this.velocity.x === 0 ? 0 : this.velocity.x > 0 ? 1 : -1
    this.velocity.y -= 1
  }

  inArea(area: Area) {
    return (
      between(this.x, area.x[0], area.x[1]) &&
      between(this.y, area.y[0], area.y[1])
    )
  }

  pastArea(area: Area) {
    const maxX = Math.max(...area.x)
    if (this.x > maxX) return true
    const minY = Math.min(...area.y)
    return this.y < minY
  }
}

const area: Area = { x: [areaX[0], areaX[1]], y: [areaY[0], areaY[1]] }

function testProbe(velocity: Velocity) {
  const probe = new Probe(0, 0, velocity)

  while (!probe.inArea(area)) {
    probe.step()
    if (probe.pastArea(area)) {
      return null
    }
  }

  return probe.highestY
}

const possibleVelocities: Velocity[] = []

// Optimization problems bring back bad memories of calculus so instead I'm brute forcing it
for (let x = 0; x < 1000; x++) {
  for (let y = -1000; y < 1000; y++) {
    const velocity = { x, y }
    const height = testProbe(velocity)
    if (height !== null) {
      possibleVelocities.push(velocity)
    }
  }
}

console.log(possibleVelocities.length, possibleVelocities)
