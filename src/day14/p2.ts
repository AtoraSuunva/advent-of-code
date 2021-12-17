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

/**
 * Increments a single value in a map of `T => number`
 *
 * Properly increments in cases with missing keys
 * @param map The map to increment
 * @param key The key to increment
 * @param value The value to increment by
 * @returns The map that was incremented
 */
function incrementMap<K>(
  map: Map<K, number>,
  key: K,
  value: number,
): Map<K, number> {
  const newValue = (map.get(key) ?? 0) + value
  map.set(key, newValue)
  return map
}

// Count cache should take into account the rules to ensure it's not caching unrelated rules
// But that's a problem for another time, for this case where the rules don't change it works
const countCache = new Map<string, Map<string, number>>()

function applyRules(
  polymer: string,
  polymerRules: Record<string, string>,
  maxSteps: number,
  currentStep = 0,
): Map<string, number> {
  console.log(currentStep)

  // Check the cache in case we already know the counts for this polymer + step
  const cacheKey = `${polymer}${currentStep}`
  const existingCache = countCache.get(cacheKey)
  if (existingCache) {
    return existingCache
  }

  const counts = new Map<string, number>()

  // If we reached the max number of steps, stop mapping the polymer and return the count of elements
  if (currentStep >= maxSteps) {
    // Remove the last element from the count
    // It's reused over several pairs and if we count it, it will be counted an incorrect number of times
    for (const char of polymer.substring(0, polymer.length - 1)) {
      incrementMap(counts, char, 1)
    }
    return counts
  }

  // Otherwise, get all the pairs and apply the rules on those
  const pairs = getPairs(polymer)
  const pairResults = pairs.map((p) =>
    applyRules(
      `${p[0]}${polymerRules[p]}${p[1]}`,
      polymerRules,
      maxSteps,
      currentStep + 1,
    ),
  )

  // Merge the results of the pairs into the counts
  for (const result of pairResults) {
    for (const [key, value] of result) {
      incrementMap(counts, key, value)
    }
  }

  // If this is the first step, then add the final element to the final count
  // We don't count this in other parts since it leads to counting that element too many times
  if (currentStep === 0) {
    const lastChar = polymer[polymer.length - 1]
    incrementMap(counts, lastChar, 1)
  }

  // Cache and return
  countCache.set(cacheKey, counts)
  return counts
}

console.log({ template, rules })

const MAX_STEPS = 40

const results = applyRules(template, rules, MAX_STEPS)

console.log(results)

const nums = Array.from([...results.values()])
const min = Math.min(...nums)
const max = Math.max(...nums)

console.log({ min, max })
console.log(`${max} - ${min} = ${max - min}`)
