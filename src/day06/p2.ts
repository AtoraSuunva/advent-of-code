import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const lanternFish = input
  .trim()
  .split(',')
  .map((v) => parseInt(v, 10))

const DAYS = 256
// Index of array maps from timer to number of fish at that timer
// ie. `fishes[0]` is the number of fish with timer 0
const fishes: number[] = new Array(9).fill(0)
// Need to get the initial amount of fish at each timer too
// Map<timer, numberOfFish>
const fishCount = new Map<number, number>()

// Count the number of fish at each timer from the input
for (const fish of lanternFish) {
  fishCount.set(fish, (fishCount.get(fish) ?? 0) + 1)
}

// Insert them into our timer array
for (const [timer, fishNum] of fishCount.entries()) {
  fishes[timer] = fishNum
}

console.log(
  fishes.join(','),
  fishes.reduce((a, b) => a + b),
)

for (let i = 1; i <= DAYS; i++) {
  console.log(`Day ${i}`)
  // Get all fish with a timer of 0
  const spawns = fishes.shift() ?? 0
  // Add in the children they spawn at timer 8 (end of array)
  fishes.push(spawns)
  // Reset their timer to 6
  fishes[6] += spawns
  console.log(
    fishes.join(','),
    fishes.reduce((a, b) => a + b),
  )
}

console.log(
  `\nThere are ${fishes.reduce((a, b) => a + b)} fish after ${DAYS} days`,
)
