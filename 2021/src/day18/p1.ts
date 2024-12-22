import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const parsedInput = input
  .trim()
  .split('\n')
  .map((l) => JSON.parse(l) as SnailfishTuple)

type SnailfishValue = number | SnailfishTuple
type SnailfishTuple = [SnailfishValue, SnailfishValue]

abstract class Node {
  public parent: Node | null = null
  public left: Node | null = null
  public right: Node | null = null
}

interface NodeWithDepth<N> {
  node: N
  depth: number
}

class BinaryNode extends Node {
  public override parent: BinaryNode | null = null

  constructor(
    public override left: BinaryNode | ValueNode,
    public override right: BinaryNode | ValueNode,
  ) {
    super()
    this.left.parent = this
    this.right.parent = this
  }

  /**
   * Gets the first left ValueNode to this node
   *
   * ie. For [[1,2],[[3,4],5]]:
   *
   * Calling it on Node<3> would return Node<2>
   *
   * Calling it on Node<5> would return Node<4>
   *
   * Calling it on Node<1> would return null
   */
  public getFirstLeft(): ValueNode | null {
    if (!this.parent) return null
    if (this.parent.right === this) {
      return this.parent.left.getRightmostValueNode()
    }

    // We're the left node
    let currentNode = this.parent
    while (currentNode.parent && currentNode === currentNode.parent.left) {
      currentNode = currentNode.parent
    }

    if (currentNode.parent === null) return null
    return currentNode.parent.left.getRightmostValueNode()
  }

  /**
   * Gets the first left ValueNode to this node
   *
   * ie. For [[1,2],[[3,4],5]]:
   *
   * Calling it on Node<3> would return Node<4>
   *
   * Calling it on Node<5> would return null
   *
   * Calling it on Node<2> would return 3
   */
  public getFirstRight(): ValueNode | null {
    if (!this.parent) return null
    if (this.parent.left === this) {
      return this.parent.right.getLeftmostValueNode()
    }

    // We're the right node
    let currentNode = this.parent
    while (currentNode.parent && currentNode === currentNode.parent.right) {
      currentNode = currentNode.parent
    }

    if (currentNode.parent === null) return null
    return currentNode.parent.right.getLeftmostValueNode()
  }

  public getLeftmostValueNode(): ValueNode {
    return this.left.getLeftmostValueNode()
  }

  public getRightmostValueNode(): ValueNode {
    return this.right.getRightmostValueNode()
  }

  public getValue(): number {
    return this.left.getValue()
  }

  public magnitude(): number {
    return 3 * this.left.magnitude() + 2 * this.right.magnitude()
  }

  public getPairs(depth = 0): NodeWithDepth<BinaryNode>[] {
    const leftPairs =
      this.left instanceof BinaryNode ? this.left.getPairs(depth + 1) : []
    const rightPairs =
      this.right instanceof BinaryNode ? this.right.getPairs(depth + 1) : []

    return [...leftPairs, { node: this, depth }, ...rightPairs]
  }

  public getValueNodes(): ValueNode[] {
    const leftNodes =
      this.left instanceof ValueNode ? [this.left] : this.left.getValueNodes()
    const rightNodes =
      this.right instanceof ValueNode
        ? [this.right]
        : this.right.getValueNodes()

    return [...leftNodes, ...rightNodes]
  }

  public override toString(): string {
    return `[${this.left},${this.right}]`
  }
}

class ValueNode extends Node {
  public override parent: BinaryNode | null = null

  constructor(public value: number) {
    super()
  }

  /**
   * Gets the first left ValueNode to this node
   *
   * ie. For [[1,2],[[3,4],5]]:
   *
   * Calling it on Node<3> would return Node<2>
   *
   * Calling it on Node<5> would return Node<4>
   *
   * Calling it on Node<1> would return null
   */
  public getFirstLeft(): ValueNode | null {
    if (!this.parent) return null
    if (this.parent.right === this) {
      return this.parent.left.getRightmostValueNode()
    }

    // We're the left node
    let currentNode = this.parent
    while (currentNode.parent && currentNode === currentNode.parent.left) {
      currentNode = currentNode.parent
    }

    if (currentNode.parent === null) return null
    return currentNode.parent.left.getRightmostValueNode()
  }

  /**
   * Gets the first left ValueNode to this node
   *
   * ie. For [[1,2],[[3,4],5]]:
   *
   * Calling it on Node<3> would return Node<4>
   *
   * Calling it on Node<5> would return null
   *
   * Calling it on Node<2> would return 3
   */
  public getFirstRight(): ValueNode | null {
    if (!this.parent) return null
    if (this.parent.left === this) {
      return this.parent.right.getLeftmostValueNode()
    }

    // We're the right node
    let currentNode = this.parent
    while (currentNode.parent && currentNode === currentNode.parent.right) {
      currentNode = currentNode.parent
    }

    if (currentNode.parent === null) return null
    return currentNode.parent.right.getLeftmostValueNode()
  }

  public getLeftmostValueNode(): ValueNode {
    return this
  }

  public getRightmostValueNode(): ValueNode {
    return this
  }

  public getValue(): number {
    return this.value
  }

  public magnitude(): number {
    return this.value
  }

  public override toString(): string {
    return `${this.value}`
  }
}

class SnailfishNumber extends BinaryNode {
  constructor(
    left: SnailfishNumber | ValueNode,
    right: SnailfishNumber | ValueNode,
  ) {
    super(left, right)
  }

  public reduce() {
    let didAction = false

    do {
      didAction = false
      // If any pair is nested inside four pairs, the leftmost such pair explodes
      const pairs = this.getPairs()

      for (const pair of pairs) {
        if (pair.depth < 4) continue
        didAction = true
        console.log('Exploding', pair.node.toString(), 'in', this.toString())

        // Pair's left value is added to the left of the exploding pair
        const leftmost = pair.node.left.getFirstLeft()
        if (leftmost) leftmost.value += pair.node.left.getValue()

        // Pair's right value is added to the right of the exploding pair
        const rightmost = pair.node.right.getFirstRight()
        if (rightmost) rightmost.value += pair.node.right.getValue()

        // The entire exploding pair is replaced with the regular number 0
        const newNode = new ValueNode(0)
        newNode.parent = pair.node.parent
        if (pair.node.parent?.left === pair.node) {
          pair.node.parent.left = newNode
        } else if (pair.node.parent?.right === pair.node) {
          pair.node.parent.right = newNode
        }

        console.log('   Result', this.toString())
        break
      }

      // If we did an action, restart from the beginning
      if (didAction) continue

      // If any regular number is 10 or greater, the leftmost such regular number splits
      const valueNodes = this.getValueNodes()
      for (const valueNode of valueNodes) {
        if (valueNode.value < 10) continue
        didAction = true
        console.log('Splitting', valueNode.toString(), 'in', this.toString())

        const left = new ValueNode(Math.floor(valueNode.value / 2))
        const right = new ValueNode(Math.ceil(valueNode.value / 2))
        const newNode = new SnailfishNumber(left, right)
        newNode.parent = valueNode.parent

        if (valueNode.parent?.left === valueNode) {
          valueNode.parent.left = newNode
        } else if (valueNode.parent?.right === valueNode) {
          valueNode.parent.right = newNode
        }

        console.log('   Result', this.toString())
        break
      }
    } while (didAction)
  }

  public add(value: SnailfishNumber): SnailfishNumber {
    const sn = new SnailfishNumber(this, value)
    sn.reduce()
    return sn
  }

  private static getNode(value: SnailfishValue): SnailfishNumber | ValueNode {
    return typeof value === 'number'
      ? new ValueNode(value)
      : SnailfishNumber.fromTuple(value)
  }

  public static fromTuple(tuple: SnailfishTuple): SnailfishNumber {
    return new SnailfishNumber(
      SnailfishNumber.getNode(tuple[0]),
      SnailfishNumber.getNode(tuple[1]),
    )
  }
}

const firstTuple = parsedInput.shift()
if (!firstTuple) throw new Error('No first tuple')

let result = SnailfishNumber.fromTuple(firstTuple)

for (const sfTuple of parsedInput) {
  const sfNumber = SnailfishNumber.fromTuple(sfTuple)
  console.log('Adding:', `${result} + ${sfNumber}`)
  result = result.add(sfNumber)
  console.log('Result:', result.toString(), '\n')
}

console.log(result.toString(), result.magnitude())
