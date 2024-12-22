import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const polymer = input.trim()

const [template, inRules] = polymer.split('\n\n')
const rules: Record<string, string> = Object.fromEntries(
  inRules.split('\n').map((r) => r.split(' -> ')),
) as Record<string, string>

function getPairs(string: string): string[] {
  const pairs: string[] = []
  for (let i = 0; i < string.length - 1; i++) {
    const pair = string.slice(i, i + 2)
    if (rules[pair]) {
      pairs.push(pair)
    }
  }
  return pairs
}

console.log({ template, rules })

let currentTemplate = template

for (let step = 0; step < 10; step++) {
  const pairs = getPairs(currentTemplate)
  currentTemplate =
    template[0] + pairs.map((p) => `${rules[p]}${p[1]}`).join('')
}

const counts = new Map<string, number>()

for (let i = 0; i < currentTemplate.length; i++) {
  const c = currentTemplate[i]
  counts.set(c, (counts.get(c) || 0) + 1)
}

const nums = Array.from(counts.values())
const min = Math.min(...nums)
const max = Math.max(...nums)

console.log(counts, { min, max })
console.log(`${max} - ${min} = ${max - min}`)
