import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const paths = input
  .trim()
  .split('\n')
  .map((line) => line.split('-'))

class Cave {
  public isBig = false
  public isStart = false
  public isEnd = false
  public connections: Cave[] = []

  constructor(public name: string) {
    // Uppercase names = big caves
    if (this.name === this.name.toUpperCase()) {
      this.isBig = true
    }

    if (this.name === 'start') {
      this.isStart = true
    }

    if (this.name === 'end') {
      this.isEnd = true
    }
  }

  addConnection(cave: Cave) {
    if (!this.isEnd && !cave.isStart) {
      this.connections.push(cave)
    }
  }

  toString() {
    return `${this.name}${this.isBig ? '*' : ' '}${
      this.connections.length > 0
        ? ' -> (' + this.connections.map((c) => c.name).join(', ') + ')'
        : ''
    }`
  }

  equals(other: Cave) {
    return this.name === other.name
  }
}

const caves = new Map<string, Cave>()

for (const [from, to] of paths) {
  if (!caves.has(from)) {
    caves.set(from, new Cave(from))
  }

  if (!caves.has(to)) {
    caves.set(to, new Cave(to))
  }

  // bi-directional connection
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  caves.get(from)!.addConnection(caves.get(to)!)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  caves.get(to)!.addConnection(caves.get(from)!)
}

console.log(
  Array.from(caves.values())
    .map((c) => c.toString())
    .join('\n'),
  '\n',
)

interface VisitStats {
  counts: Record<string, number>
  oneVisitedTwice: boolean
}

function countSmallCaveVisits(caves: Cave[]): VisitStats {
  const smallCaves = caves.filter((c) => !c.isBig)
  const counts: Record<string, number> = {}
  let oneVisitedTwice = false

  for (const cave of smallCaves) {
    counts[cave.name] = (counts[cave.name] ?? 0) + 1
    if (counts[cave.name] > 1) {
      oneVisitedTwice = true
    }
  }

  return { counts, oneVisitedTwice }
}

function getPathsTo(from: Cave, to: Cave, visited: Cave[] = []): Cave[][] {
  // Copy the array
  visited = Array.from(visited)
  visited.push(from)

  if (from.equals(to)) {
    return [visited]
  }

  // Can visit a single small cave twice
  // Can only visit all other small caves once
  const stats = countSmallCaveVisits(visited)

  const connections = from.connections.filter(
    (c) =>
      c.isBig ||
      c.isEnd ||
      !stats.oneVisitedTwice ||
      stats.counts[c.name] === undefined,
  )

  if (connections.length === 0) {
    return []
  }

  return connections.flatMap((c) => getPathsTo(c, to, visited))
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const from = caves.get('start')!
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const to = caves.get('end')!
const pathsToEnd = getPathsTo(from, to)

console.log(pathsToEnd.map((p) => p.map((c) => c.name).join(',')).join('\n'))
console.log(`There are ${pathsToEnd.length} paths to the end`)
