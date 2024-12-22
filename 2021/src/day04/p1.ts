import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const bingo = input.trim().split('\n')

const numbers = bingo
  .shift()
  ?.split(',')
  .map((v) => parseInt(v, 10))

if (!numbers) {
  throw new Error('Failed to parse input, no numbers found')
}

class BingoNumber {
  public number: number
  public isMarked = false

  constructor(number: number) {
    this.number = number
  }

  public markNumber(num: number): boolean {
    if (this.number === num) {
      this.isMarked = true
      return true
    } else {
      return false
    }
  }

  public toString(): string {
    return `${this.isMarked ? '★' : ' '}${this.number
      .toString()
      .padStart(2, ' ')}`
  }
}

class BingoBoard {
  public static HEIGHT = 6
  private board: BingoNumber[][]

  constructor(numbers: number[][]) {
    this.board = numbers.map((a) => a.map((v) => new BingoNumber(v)))
  }

  static fromString(input: string): BingoBoard {
    const numbers = input
      .trim()
      .split('\n')
      .map((l) =>
        l
          .trim()
          .split(/\s\s?/g)
          .map((n) => parseInt(n, 10)),
      )
    return new BingoBoard(numbers)
  }

  public markNumber(num: number): void {
    this.board.forEach((row) => {
      row.forEach((n) => n.markNumber(num))
    })
  }

  public isBingo(): boolean {
    return this.hasHorizontalBingo() || this.hasVerticalBingo()
  }

  private hasHorizontalBingo(): boolean {
    return this.board.some((row) => row.every((n) => n.isMarked))
  }

  private hasVerticalBingo(): boolean {
    for (let i = 0; i < this.board[0].length; i++) {
      const column = this.board.map((row) => row[i])
      if (column.every((n) => n.isMarked)) {
        return true
      }
    }
    return false
  }

  private hasDiagonalBingo(): boolean {
    const diag1 = this.board.map((row, i) => row[i])
    const diag2 = this.board.map((row, i) => row[row.length - i - 1])
    return diag1.every((n) => n.isMarked) || diag2.every((n) => n.isMarked)
  }

  public getUnmarkedNumbers(): number[] {
    return this.board.flatMap((row) =>
      row.filter((n) => !n.isMarked).map((n) => n.number),
    )
  }

  public toString(): string {
    const header = '  B    I    N    G    O'
    const body = this.board
      .map((row) => row.map((v) => v.toString().padStart(2, ' ')).join('  '))
      .join('\n')
    const footer = this.isBingo() ? 'Winner!'.padStart(23, ' ') : ''

    return `${header}\n${body}\n${footer}`
  }
}

const boards: BingoBoard[] = []

for (let i = 0; i < bingo.length; i += BingoBoard.HEIGHT) {
  const board = BingoBoard.fromString(
    bingo.slice(i, i + BingoBoard.HEIGHT).join('\n'),
  )

  boards.push(board)
}

let nextNumber = 0
while (boards.every((board) => !board.isBingo())) {
  const tmp = numbers.shift()

  if (tmp === undefined) {
    throw new Error('No more numbers, and no winner')
  }

  nextNumber = tmp
  boards.forEach((board) => board.markNumber(nextNumber))
}

const winner = boards.find((board) => board.isBingo())

if (!winner) {
  console.log(boards.map((b) => b.toString()).join('\n\n'))
  throw new Error('No winner found')
}

const unmarked = winner.getUnmarkedNumbers()
const sum = unmarked.reduce((acc, v) => acc + v, 0)
const result = sum * nextNumber

console.log(unmarked)

console.log(
  boards.map((b) => b.toString()).join('\n\n') +
    `\n\nFinal Score: ${sum} * ${nextNumber} = ${result}`,
)
