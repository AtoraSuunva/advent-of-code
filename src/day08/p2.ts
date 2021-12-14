import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const entries = input
  .trim()
  .split('\n')
  .map((line) => {
    const [patterns, output] = line.split(' | ').map((l) => l.split(' '))
    return { patterns, output }
  })

class MathSet<T> extends Set<T> {
  /**
   * Unions this set with another set, creating a new set with all the elements of both sets
   * @param other The other set to union to this set
   * @returns The union of both sets
   */
  union(other: MathSet<T>): MathSet<T> {
    const result = new MathSet<T>(this)
    other.forEach((value) => result.add(value))
    return result
  }

  /**
   * Unions this set with 1 value, creating a new set with that value added
   * @param value The value to add
   * @returns A new set with that value added
   */
  unionValue(value: T): MathSet<T> {
    return this.union(new MathSet<T>([value]))
  }

  /**
   * Intersection of this set with another set, creating a new set with the elements that are in both sets
   * @param other The other set to intersect with this set
   * @returns The intersection of both sets
   */
  intersection(other: MathSet<T>): MathSet<T> {
    const result = new MathSet<T>()
    this.forEach((value) => {
      if (other.has(value)) result.add(value)
    })
    return result
  }

  /**
   * Subtracts another set from this set, creating a new set with the elements that are in this set but not in the other set
   * @param other The other set to substract from this set
   * @returns A copy of this set with elements from the other set removed
   */
  minus(other: MathSet<T>): MathSet<T> {
    const result = new MathSet<T>(this)
    other.forEach((value) => result.delete(value))
    return result
  }

  /**
   * Subtracts a value from the set, returning a new copy
   * @param value The value to remove
   * @returns A new set with the value removed
   */
  minusValue(other: T): MathSet<T> {
    return this.minus(new MathSet<T>([other]))
  }

  /**
   * Gets the only element in this set, or throws an error if there is not exactly one element in this set
   *
   * Ensures the set is properly reduced to a single element when doing the set math
   * @returns The only element in this set
   */
  getOne(): T {
    if (this.size !== 1) throw new Error('Set has more than one element')
    const one = [...this][0]
    if (!one) throw new Error('Set has no elements')
    return one
  }

  /**
   * Check if this set has all values contained in another set
   * @param other The other set to compare this set to
   * @returns If this set has all the values contained in the other set
   */
  hasAll(other: MathSet<T>): boolean {
    return [...other].every((value) => this.has(value))
  }

  /**
   * Check two MathSets for equality
   * @param other The other set to compare this set to
   * @returns If both sets contain the same values
   */
  equals(other: MathSet<T>): boolean {
    return (
      this.size === other.size && [...this].every((value) => other.has(value))
    )
  }
}

function getDigitFromPatterns(
  patterns: string[],
  length: number,
): MathSet<string> {
  const digit = patterns.find((p) => p.length === length)
  if (digit === undefined) {
    throw new Error(`No pattern found for length ${length}`)
  }
  return new MathSet(digit)
}

function getKnownDigits(patterns: string[]) {
  const one = getDigitFromPatterns(patterns, 2)
  const four = getDigitFromPatterns(patterns, 4)
  const seven = getDigitFromPatterns(patterns, 3)
  const eight = getDigitFromPatterns(patterns, 7)
  return { one, four, seven, eight }
}

function findOne<T>(arr: T[], predicate: (value: T) => boolean): T {
  const value = arr.find(predicate)
  if (value === undefined) throw new Error('No value found')
  return value
}

let totalOutput = 0

for (const entry of entries) {
  console.log(entry, '\n')
  const { patterns, output } = entry
  const patternSets = patterns.map((p) => new MathSet(p))
  const { one, four, seven, eight } = getKnownDigits(patterns)

  const a = seven.minus(one).getOne()
  const bd = four.minus(one)
  const nine = findOne(
    patternSets,
    (p) => p.size === 6 && p.hasAll(four.unionValue(a)),
  )
  const e = eight.minus(nine).getOne()
  const abcdf = four.unionValue(a)
  const g = nine.minus(abcdf).getOne()
  const six = findOne(
    patternSets,
    (p) => p.size === 6 && p.hasAll(bd) && !p.equals(nine),
  )
  const zero = findOne(
    patternSets,
    (p) => p.size === 6 && !p.equals(six) && !p.equals(nine),
  )
  const d = eight.minus(zero).getOne()
  const b = bd.minusValue(d).getOne()
  const c = eight.minus(six).getOne()
  const f = one.minusValue(c).getOne()
  const acdeg = new MathSet([a, c, d, e, g])
  const two = findOne(patternSets, (p) => p.size === 5 && p.equals(acdeg))
  const acdfg = new MathSet([a, c, d, f, g])
  const three = findOne(patternSets, (p) => p.size === 5 && p.equals(acdfg))
  const abdfg = new MathSet([a, b, d, f, g])
  const five = findOne(patternSets, (p) => p.size === 5 && p.equals(abdfg))

  console.log({ a, b, c, d, e, f, g })
  console.log({ zero, one, two, three, four, five, six, seven, eight, nine })

  const digits: number[] = []
  for (const out of output) {
    const outSet = new MathSet(out)
    if (outSet.equals(zero)) {
      digits.push(0)
    } else if (outSet.equals(one)) {
      digits.push(1)
    } else if (outSet.equals(two)) {
      digits.push(2)
    } else if (outSet.equals(three)) {
      digits.push(3)
    } else if (outSet.equals(four)) {
      digits.push(4)
    } else if (outSet.equals(five)) {
      digits.push(5)
    } else if (outSet.equals(six)) {
      digits.push(6)
    } else if (outSet.equals(seven)) {
      digits.push(7)
    } else if (outSet.equals(eight)) {
      digits.push(8)
    } else if (outSet.equals(nine)) {
      digits.push(9)
    }
  }

  const outputValue = parseInt(digits.join(''), 10)
  console.log(outputValue)
  totalOutput += outputValue
}

console.log(`Total output: ${totalOutput}`)
