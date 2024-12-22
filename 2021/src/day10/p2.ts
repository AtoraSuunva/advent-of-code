import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const lines = input
  .trim()
  .split('\n')
  .map((line) => line.split(''))

const closingChars = [')', ']', '}', '>']
const matchingPair = {
  '(': ')',
  ')': '(',
  '[': ']',
  ']': '[',
  '{': '}',
  '}': '{',
  '<': '>',
  '>': '<',
}
type MPK = keyof typeof matchingPair

function parseLine(line: string[]): string[] | null {
  const stack: string[] = []

  for (const char of line) {
    if (closingChars.includes(char)) {
      if (stack.pop() !== matchingPair[char as MPK]) {
        // Corrupted line
        return null
      }
    } else {
      stack.push(char)
    }
  }

  return stack
}

const scoringTable = {
  ')': 1,
  ']': 2,
  '}': 3,
  '>': 4,
}

type STK = keyof typeof scoringTable

function notNull<T>(val: T | null): val is T {
  return val !== null
}

const result = lines
  .map(parseLine)
  .filter(notNull)
  .map((l) =>
    l
      .map((c) => scoringTable[matchingPair[c as MPK] as STK])
      .reverse()
      .reduce((acc, cur) => acc * 5 + cur, 0),
  )
  .sort((a, b) => a - b)

// Get middle result
console.log(result[(result.length - 1) / 2])
