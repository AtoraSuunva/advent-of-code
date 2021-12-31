import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const [p1, p2] = input
  .trim()
  .split('\n')
  .map((l) => parseInt(l.split(' ')[4], 10))

const MAX_WINS = 21
// All possible rolls on our quantum dice
const ROLLS = [1n, 2n, 3n]

// Cache resuls or the recursion will take forever
const cache = new Map<string, [bigint, bigint]>()

function countWins(
  position1: bigint,
  position2: bigint,
  score1 = 0n,
  score2 = 0n,
): [bigint, bigint] {
  if (score1 >= MAX_WINS) return [1n, 0n]
  if (score2 >= MAX_WINS) return [0n, 1n]

  const key = `${position1}-${position2}-${score1}-${score2}`
  if (cache.has(key)) return cache.get(key)!

  let totalWins: [bigint, bigint] = [0n, 0n]

  for (const die1 of ROLLS) {
    for (const die2 of ROLLS) {
      for (const die3 of ROLLS) {
        const newPosition1 = (position1 + die1 + die2 + die3) % 10n || 10n
        const newScore1 = score1 + newPosition1

        // Flip positions and scores to simulate turns alternating
        const [wins1, wins2] = countWins(
          position2,
          newPosition1,
          score2,
          newScore1,
        )
        // Also flip the wins counted here
        totalWins = [totalWins[0] + wins2, totalWins[1] + wins1]
      }
    }
  }

  cache.set(key, totalWins)
  return totalWins
}

const wins = countWins(BigInt(p1), BigInt(p2))
console.log(wins)
// Lol Math.max doesn't work for bigint
console.log(wins[0] > wins[1] ? wins[0] : wins[1])
