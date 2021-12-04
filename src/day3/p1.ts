import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const report = input.trim().split('\n')

const count0: number[] = []
const count1: number[] = []

for (const line of report) {
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '0') {
      count0[i] = (count0[i] || 0) + 1
    } else if (line[i] === '1') {
      count1[i] = (count1[i] || 0) + 1
    }
  }
}

const gamma: string[] = []
const elipson: string[] = []

for (let i = 0; i < count0.length; i++) {
  if (count0[i] > count1[i]) {
    gamma.push('0')
    elipson.push('1')
  } else {
    gamma.push('1')
    elipson.push('0')
  }
}

const g = parseInt(gamma.join(''), 2)
const e = parseInt(elipson.join(''), 2)

console.log(gamma.join(''), elipson.join(''))
console.log(`Final answer: Gamma: ${g} * Elipson: ${e} = ${g * e}`)
