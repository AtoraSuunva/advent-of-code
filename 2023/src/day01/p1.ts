import fs from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')

const notNumRegex = /[^0-9]/g
const parsedInput = input.trim()
  .split('\n')
  .map(l => l.replaceAll(notNumRegex, ''))
  .map(l => parseInt(l[0] + l[l.length - 1], 10))
  .reduce((acc, cur) => acc + cur, 0)

console.log(parsedInput)
