import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const crabs = input
  .trim()
  .split(',')
  .map((v) => parseInt(v, 10))

const minPos = Math.min(...crabs)
const maxPos = Math.max(...crabs)

// Map position -> crabs at that position
const crabPositions = new Map<number, number>()

for (const crab of crabs) {
  crabPositions.set(crab, (crabPositions.get(crab) ?? 0) + 1)
}

const fuelCosts = new Map<number, number>()

for (let i = minPos; i <= maxPos; i++) {
  let cost = 0
  for (const [position, numCrabs] of crabPositions.entries()) {
    cost += sumIntegersTo(Math.abs(i - position)) * numCrabs
  }
  fuelCosts.set(i, cost)
  console.log(`Postion ${i} requires ${cost} units of fuel`)
}

const minFuel = Math.min(...fuelCosts.values())
const bestPosition = Array.from(fuelCosts.entries()).find(
  ([, cost]) => cost === minFuel,
)?.[0]

console.log(
  `\nOptimal position ${bestPosition} requires ${minFuel} units of fuel`,
)

/**
 * Sums all positive integers up to n (1 to n)
 *
 * https://en.wikipedia.org/wiki/1_%2B_2_%2B_3_%2B_4_%2B_%E2%8B%AF
 * @example
 *
 * sumIntegersTo(1) // 1 = 1
 * sumIntegersTo(2) // 1 + 2 = 3
 * sumIntegersTo(3) // 1 + 2 + 3 = 6
 * sumIntegersTo(4) // 1 + 2 + 3 + 4 = 10
 *
 * @param n The upper bound
 */
function sumIntegersTo(n: number): number {
  return (n * (n + 1)) / 2
}
