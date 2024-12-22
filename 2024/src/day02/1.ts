import fs from 'node:fs/promises'

const input = await fs.readFile(`${import.meta.dirname}/input.txt`, 'utf8')

let increasing: boolean | null = null

const out = input
  .trim()
  .split('\n')
  .map((v) =>
    v
      .split(' ')
      .map((v) => Number.parseInt(v))
      .every((v, i, a) => {
        if (i === 0) {
          increasing = v < a[i + 1]
          return true
        }

        if (a[i - 1] === v) return false

        const diff = Math.abs(a[i - 1] - v)
        const inc = a[i - 1] < v

        return inc === increasing && diff > 0 && diff <= 3
      }),
  )
  .reduce((acc, v) => acc + (v ? 1 : 0), 0)

console.log(out)
