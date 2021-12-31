import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'test-input.txt')
const input = await fs.readFile(file, 'utf8')
const parsedInput = input
  .trim()
  .split('\n')
  .map((l) => parseInt(l.split(' ')[4], 10))

interface Die {
  sides: number
  timesRolled: number
  roll(): number
}

class DeterministicDie implements Die {
  private counter = 0
  public timesRolled = 0

  constructor(public sides: number) {}

  public roll(): number {
    this.counter++
    this.timesRolled++

    if (this.counter > this.sides) {
      this.counter = 1
    }

    return this.counter
  }
}

class Pawn {
  public score = 0
  public lastRoll = ''

  constructor(public name: string, public position: number) {}
}

interface BoardOptions {
  pawns: Pawn[]
  spaces: number
  die: Die
}

class Board {
  public currentTurn = 0
  public pawns: Pawn[]
  public spaces: number
  public die: Die

  constructor(options: BoardOptions) {
    this.pawns = options.pawns
    this.spaces = options.spaces
    this.die = options.die
  }

  public nextTurn(): Pawn {
    const currentPawn = this.pawns[this.currentTurn % this.pawns.length]
    // Roll 3 times
    const rolls = [this.die.roll(), this.die.roll(), this.die.roll()]
    const roll = rolls.reduce((acc, roll) => acc + roll, 0)
    currentPawn.position = ((currentPawn.position + roll - 1) % this.spaces) + 1
    currentPawn.lastRoll = rolls.join(' + ')
    currentPawn.score += currentPawn.position
    this.currentTurn++
    return currentPawn
  }
}

const player1 = new Pawn('Player 1', parsedInput[0])
const player2 = new Pawn('Player 2', parsedInput[1])
const die = new DeterministicDie(100)
const winningScore = 1000

const board = new Board({
  pawns: [player1, player2],
  spaces: 10,
  die,
})

while (board.pawns.every((p) => p.score < winningScore)) {
  const currentPawn = board.nextTurn()
  console.log(
    `${board.die.timesRolled} ${currentPawn.name} rolls ${currentPawn.lastRoll} and moves to space ${currentPawn.position} for a total score of ${currentPawn.score}`,
  )
}

const loser = board.pawns.find((p) => p.score < winningScore)

if (!loser) {
  throw new Error('No loser found')
}

console.log(`${loser.name} loses!`)
console.log(
  `${loser.score} * ${board.die.timesRolled} = ${
    loser.score * board.die.timesRolled
  }`,
)
