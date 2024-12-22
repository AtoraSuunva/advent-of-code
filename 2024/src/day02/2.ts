import fs from 'node:fs/promises'

const input = await fs.readFile(`${import.meta.dirname}/input.txt`, 'utf8')

const out = input
  .trim()
  .split('\n')
  .map((v) => checkSafety(v.split(' ').map((v) => Number.parseInt(v))))
  .reduce((acc, v) => acc + (v ? 1 : 0), 0)

console.log(out)

function checkSafety(levels: number[], problemDampened = false): boolean {
  let increasing: boolean | null = null

  const isSafe = levels.every((v, i, a) => {
    if (i === 0) {
      increasing = v < a[i + 1]
      return true
    }

    if (a[i - 1] === v) return false

    const diff = Math.abs(a[i - 1] - v)
    const inc = a[i - 1] < v

    return inc === increasing && diff > 0 && diff <= 3
  })

  if (problemDampened || isSafe) return isSafe

  const copy = levels.slice()
  let rm: number[] = []

  for (let i = 0; i < copy.length + 1; i++) {
    rm = copy.splice(i === 0 ? 0 : i - 1, 1, ...rm)

    if (checkSafety(copy, true)) return true
  }

  return false
}
