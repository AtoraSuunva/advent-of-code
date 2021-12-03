import fs from 'fs/promises'

const input = await fs.readFile('./src/day2/input.txt', 'utf8')

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
  aim: 0,
}

const commands = {
  forward: (param: number) => {
    coords.position += param
    coords.depth += param * coords.aim
  },
  down: (param: number) => (coords.aim += param),
  up: (param: number) => (coords.aim -= param),
}

for (const step of course) {
  if (step.cmd in commands) {
    commands[step.cmd](step.param)
  }
}

console.log(coords)
console.log(`Final answer: ${coords.position * coords.depth}`)
