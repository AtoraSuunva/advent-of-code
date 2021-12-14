import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'test-input.txt')
const input = await fs.readFile(file, 'utf8')
const octopi = input
  .trim()
  .split('\n')
  .map((line) => line.split('').map((c) => parseInt(c, 10)))

class Octopus {
  flashedThisStep = false
  constructor(
    public energy: number,
    public x: number,
    public y: number,
    public matrix: Matrix<Octopus>,
  ) {}

  nextStep() {
    this.flashedThisStep = false
    this.increaseEnergy()
  }

  increaseEnergy() {
    // If we flashed we can't gain energy through any means
    if (!this.flashedThisStep) {
      this.energy++
    }
  }

  checkForFlash(): boolean {
    if (this.energy > 9 && !this.flashedThisStep) {
      this.flash()
      return true
    }
    return false
  }

  flash() {
    // Can't flash twice a step
    if (this.flashedThisStep) return

    this.flashedThisStep = true

    // Increase energy of adjacent octopi
    this.matrix
      .getAdjacent(this.x, this.y)
      .forEach((oct) => oct.increaseEnergy())

    this.energy = 0
  }

  toString() {
    if (this.energy > 9) {
      return '\x1b[44m#\x1b[0m'
    }

    if (this.flashedThisStep) {
      return `\x1b[41m${this.energy}\x1b[0m`
    }

    return this.energy.toString()
  }
}

function notUndefined<T>(val: T | undefined): val is T {
  return val !== undefined
}

interface MatrixCell<T> {
  x: number
  y: number
  value: T
}

class Matrix<T> implements Iterable<MatrixCell<T>> {
  constructor(public values: T[][]) {}

  get(x: number, y: number): T | undefined {
    return this.values[y]?.[x]
  }

  getAdjacent(x: number, y: number): T[] {
    return [
      this.get(x - 1, y - 1),
      this.get(x, y - 1),
      this.get(x + 1, y - 1),
      this.get(x - 1, y),
      this.get(x + 1, y),
      this.get(x - 1, y + 1),
      this.get(x, y + 1),
      this.get(x + 1, y + 1),
    ].filter(notUndefined)
  }

  forEach(callback: (cell: MatrixCell<T>) => void) {
    for (const cell of this) {
      callback(cell)
    }
  }

  map<U>(callback: (cell: MatrixCell<T>) => U) {
    const values: U[] = []
    for (const cell of this) {
      values.push(callback(cell))
    }
    return values
  }

  toString() {
    return this.values.map((row) => row.map((v) => v + '').join('')).join('\n')
  }

  *[Symbol.iterator](): Iterator<MatrixCell<T>, void, undefined> {
    for (let y = 0; y < this.values.length; y++) {
      for (let x = 0; x < this.values[y].length; x++) {
        const value = this.values[y][x]
        yield { x, y, value }
      }
    }
  }
}

const knownSteps = [
  `5483143223
2745854711
5264556173
6141336146
6357385478
4167524645
2176841721
6882881134
4846848554
5283751526`,
  `6594254334
3856965822
6375667284
7252447257
7468496589
5278635756
3287952832
7993992245
5957959665
6394862637`,
  `8807476555
5089087054
8597889608
8485769600
8700908800
6600088989
6800005943
0000007456
9000000876
8700006848`,
  `0050900866
8500800575
9900000039
9700000041
9935080063
7712300000
7911250009
2211130000
0421125000
0021119000`,
  `2263031977
0923031697
0032221150
0041111163
0076191174
0053411122
0042361120
5532241122
1532247211
1132230211`,
  `4484144000
2044144000
2253333493
1152333274
1187303285
1164633233
1153472231
6643352233
2643358322
2243341322`,
  `5595255111
3155255222
3364444605
2263444496
2298414396
2275744344
2264583342
7754463344
3754469433
3354452433`,
  `6707366222
4377366333
4475555827
3496655709
3500625609
3509955566
3486694453
8865585555
4865580644
4465574644`,
  `7818477333
5488477444
5697666949
4608766830
4734946730
4740097688
6900007564
0000009666
8000004755
6800007755`,
  `9060000644
7800000976
6900000080
5840000082
5858000093
6962400000
8021250009
2221130009
9111128097
7911119976`,
  `0481112976
0031112009
0041112504
0081111406
0099111306
0093511233
0442361130
5532252350
0532250600
0032240000`,
]

knownSteps[20] = `3936556452
5686556806
4496555690
4448655580
4456865570
5680086577
7000009896
0000000344
6000000364
4600009543`

knownSteps[30] = `0643334118
4253334611
3374333458
2225333337
2229333338
2276733333
2754574565
5544458511
9444447111
7944446119`

knownSteps[40] = `6211111981
0421111119
0042111115
0003111115
0003111116
0065611111
0532351111
3322234597
2222222976
2222222762`

knownSteps[50] = `9655556447
4865556805
4486555690
4458655580
4574865570
5700086566
6000009887
8000000533
6800000633
5680000538`

knownSteps[60] = `2533334200
2743334640
2264333458
2225333337
2225333338
2287833333
3854573455
1854458611
1175447111
1115446111`

knownSteps[70] = `8211111164
0421111166
0042111114
0004211115
0000211116
0065611111
0532351111
7322235117
5722223475
4572222754`

knownSteps[80] = `1755555697
5965555609
4486555680
4458655580
4570865570
5700086566
7000008666
0000000990
0000000800
0000000000`

knownSteps[90] = `7433333522
2643333522
2264333458
2226433337
2222433338
2287833333
2854573333
4854458333
3387779333
3333333333`

knownSteps[100] = `0397666866
0749766918
0053976933
0004297822
0004229892
0053222877
0532222966
9322228966
7922286866
6789998766`

function compareToKnown(stepNumber: number, step: string) {
  const known = knownSteps[stepNumber]
  // Remove color characters
  // eslint-disable-next-line no-control-regex
  const cleanStep = step.replaceAll(/\x1b\[\d\d?m/g, '')
  if (known) {
    if (known !== cleanStep) {
      console.log(`Step ${stepNumber.toString().padStart(2, ' ')}:`)
      console.log(` Expected:\n${known}`)
      console.log(`   Actual:\n${step}`)
      throw new Error(`Step ${stepNumber} failed`)
    }
  }
}

// Terrible method of letting octopi have a reference to their containing matrix but
const octoMatrix = new Matrix<Octopus>([])
const octoObjs: Octopus[][] = []

for (let y = 0; y < octopi.length; y++) {
  octoObjs.push([])
  for (let x = 0; x < octopi[y].length; x++) {
    const value = octopi[y][x]
    octoObjs[y].push(new Octopus(value, x, y, octoMatrix))
  }
}

octoMatrix.values = octoObjs

const maxSteps = 100
let totalFlashes = 0

console.log('Before any steps:')
console.log(octoMatrix.toString())

for (let step = 1; step <= maxSteps; step++) {
  console.log(`\nStep ${step.toString().padStart(2, ' ')}---`)

  // Run the step
  octoMatrix.forEach((cell) => cell.value.nextStep())
  // Log after increase, before flash check
  console.log(octoMatrix.toString(), '\n')

  // Keep checking for flashes until it resolves
  let flashes
  do {
    flashes = octoMatrix.map((cell) => cell.value.checkForFlash())
    totalFlashes += flashes.filter((flash) => flash).length
    // Log result after flash
    console.log(octoMatrix.toString(), '\n')
  } while (flashes.some((flash) => flash))

  compareToKnown(step, octoMatrix.toString())
}

console.log(`Total flashes: ${totalFlashes}`)
