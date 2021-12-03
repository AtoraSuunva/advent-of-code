import fs from 'fs/promises'

const input = await fs.readFile('./src/day1/input.txt', 'utf8')

let increases = 0
const depths = input
  .trim()
  .split('\n')
  .map((v) => parseInt(v))

for (let i = 0; i < depths.length; i++) {
  if (depths[i] < depths[i + 1]) {
    increases++
  }
}

console.log(`Increased ${increases} times`)
