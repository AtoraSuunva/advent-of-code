import fs from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')

const numberRegex = /(?=([0-9]|one|two|three|four|five|six|seven|eight|nine))/g

const numberMap: Record<string, string | undefined> = {
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
}

const parsedInput = input.trim().split('\n')
  .map(l => [...l.matchAll(numberRegex)])
  .map(l => parseInt([l[0], l[l.length - 1]].map(m => numberMap[m[1]] ?? m[1]).join(''), 10))
  .reduce((acc, cur) => acc + cur, 0)

console.log(parsedInput)
