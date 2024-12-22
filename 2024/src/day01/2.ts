import fs from 'node:fs/promises'

const input = await fs.readFile(`${import.meta.dirname}/input.txt`, 'utf8')

const left: number[] = []
const right: Map<string, number> = new Map()

for (const s of input.trim().split('\n')) {
  s.split('   ').forEach((v, i) => {
    if (i === 0) {
      left.push(Number.parseInt(v))
    } else {
      right.set(v, (right.get(v) ?? 0) + 1)
    }
  })
}

let similarity = 0

for (let i = 0; i < left.length; i++) {
  similarity += left[i] * (right.get(`${left[i]}`) ?? 0)
}

console.log(similarity)
