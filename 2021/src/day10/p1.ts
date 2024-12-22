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

const illegalCharacters: string[] = []

for (const line of lines) {
  const stack: string[] = []

  for (const char of line) {
    if (closingChars.includes(char)) {
      const last = stack.pop()
      if (last !== matchingPair[char as MPK]) {
        console.log(
          `${line.join('')}\n  - Expected ${
            matchingPair[last as MPK]
          }, but found ${char} instead.`,
        )
        illegalCharacters.push(char)
        continue
      }
    } else {
      stack.push(char)
    }
  }
}

const scoringTable = {
  ')': 3,
  ']': 57,
  '}': 1197,
  '>': 25137,
}

console.log(
  illegalCharacters
    .map((c) => scoringTable[c as keyof typeof scoringTable])
    .reduce((a, b) => a + b, 0),
)
