import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const entries = input
  .trim()
  .split('\n')
  .map((line) => {
    const [patterns, output] = line.split(' | ').map((l) => l.split(' '))
    return { patterns, output }
  })

const segmentsToDigits: Record<number, number[]> = {
  0: [],
  1: [],
  2: [1],
  3: [7],
  4: [4],
  5: [2, 3, 5],
  6: [0, 6, 9],
  7: [8],
}

console.log(entries)
const knownDigits = entries
  .map((e) =>
    e.output
      .map((o) => segmentsToDigits[o.length].length)
      .filter((l) => l === 1),
  )
  .reduce<number>((acc, cur) => acc + cur.length, 0)

console.log(knownDigits)
