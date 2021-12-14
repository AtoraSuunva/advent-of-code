import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
let fishes = input
  .trim()
  .split(',')
  .map((v) => parseInt(v, 10))

const DAYS = 80

console.log(`Initial State: ${fishes}`)

for (let i = 1; i <= DAYS; i++) {
  fishes = fishes.flatMap((v) => (v === 0 ? [6, 8] : v - 1))
  console.log(
    `After ${i.toString().padStart(2, ' ')} day${
      i === 1 ? ' ' : 's'
    }: ${fishes}`,
  )
}

console.log(`\nThere are ${fishes.length} fish after ${DAYS} days`)
