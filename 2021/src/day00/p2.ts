import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'test-input.txt')
const input = await fs.readFile(file, 'utf8')
const parsedInput = input.trim()

console.log(parsedInput)
