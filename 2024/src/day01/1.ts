import fs from 'node:fs/promises'

const input = await fs.readFile(`${import.meta.dirname}/input.txt`, 'utf8')

const left: number[] = []
const right: number[] = []

for (const s of input.trim().split('\n')) {
  s.split('   ').forEach((v, i) =>
    (i === 0 ? left : right).push(Number.parseInt(v)),
  )
}

left.sort((a, b) => a - b)
right.sort((a, b) => a - b)

let dist = 0

for (let i = 0; i < left.length; i++) {
  dist += Math.abs(left[i] - right[i])
}

console.log(dist)
