import fs from 'fs/promises'

const input = await fs.readFile('./src/day1/input.txt', 'utf8')

let increases = 0
const bucketSize = 3
const buckets: number[] = []

const depths = input
  .trim()
  .split('\n')
  .map((v) => parseInt(v))

depths.forEach((v, i) => {
  for (let j = 0; j < bucketSize; j++) {
    buckets[i - j] = (buckets[i - j] ?? 0) + v
  }
})

for (let i = 0; i < buckets.length; i++) {
  if (buckets[i] < buckets[i + 1]) {
    increases++
  }
}

console.log(`Increased ${increases} times`)
