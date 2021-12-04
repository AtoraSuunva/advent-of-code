import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')

type Command = 'forward' | 'down' | 'up'
interface CourseStep {
  cmd: Command
  param: number
}

const course: CourseStep[] = input
  .trim()
  .split('\n')
  .map((v) => {
    const [cmd, param] = v.split(' ')
    return { cmd: cmd as Command, param: parseInt(param) }
  })

const coords = {
  position: 0,
  depth: 0,
}

const commands = {
  forward: (param: number) => (coords.position += param),
  down: (param: number) => (coords.depth += param),
  up: (param: number) => (coords.depth -= param),
}

for (const step of course) {
  if (step.cmd in commands) {
    commands[step.cmd](step.param)
  }
}

console.log(coords)
console.log(`Final answer: ${coords.position * coords.depth}`)
