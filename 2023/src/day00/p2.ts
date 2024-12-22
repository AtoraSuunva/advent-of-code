import fs from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const file = join(dirname(fileURLToPath(import.meta.url)), 'test-input.txt')
const input = await fs.readFile(file, 'utf8')
const parsedInput = input.trim()

console.log(parsedInput)
