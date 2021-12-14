import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')

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
