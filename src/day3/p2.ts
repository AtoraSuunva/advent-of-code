import fs from 'fs/promises'

const input = await fs.readFile('./src/day3/input.txt', 'utf8')
const report = input.trim().split('\n')

function getRating(
  diagnostic: string[],
  keep0If: (has0: string[], has1: string[]) => boolean,
): number {
  let has0: string[] = []
  let has1: string[] = []
  let copy = Array.from(diagnostic)

  for (let i = 0; i < copy[0].length; i++) {
    for (let j = 0; j < copy.length; j++) {
      if (copy[j][i] === '0') {
        has0.push(copy[j])
      } else {
        has1.push(copy[j])
      }
    }

    if (keep0If(has0, has1)) {
      copy = has0
    } else {
      copy = has1
    }

    has0 = []
    has1 = []

    if (copy.length === 1) {
      break
    }
  }

  return parseInt(copy[0], 2)
}

const oxygen = getRating(report, (has0, has1) => has0.length > has1.length)
const co2 = getRating(report, (has0, has1) => has0.length <= has1.length)

console.log(`Final answer: Oxygen: ${oxygen} * CO2: ${co2} = ${oxygen * co2}`)
