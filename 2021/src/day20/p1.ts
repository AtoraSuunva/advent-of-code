import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const [algorithmInput, inputImageInput] = input.trim().split('\n\n')

const LIGHT_PIXEL = '#'
const DARK_PIXEL = '.'
const ALL_LIGHT_OFFSET = 0b111111111

class ImageEnhancementAlgorithm {
  constructor(public readonly data: string) {}

  public enhanceImage(image: Image): Image {
    const enhanced = image.map((x, y) => {
      const square = image.getSquare(x, y)
      return this.getPixelForSquare(square)
    })

    if (enhanced.infinity === DARK_PIXEL) {
      enhanced.infinity = this.data[0]
    } else {
      enhanced.infinity = this.data[ALL_LIGHT_OFFSET]
    }

    return enhanced
  }

  public getPixelForSquare(square: string[]): string {
    const values = square.map((v) => this.pixelToValue(v))
    const offset = parseInt(values.join(''), 2)
    return this.data[offset]
  }

  public pixelToValue(pixel: string): number {
    return pixel === DARK_PIXEL ? 0 : 1
  }
}

class Image {
  public readonly width: number
  public readonly height: number

  constructor(public readonly data: string[][], public infinity = DARK_PIXEL) {
    this.width = this.data[0].length
    this.height = this.data.length
  }

  public getPixel(x: number, y: number): string {
    return this.data[y]?.[x] || this.infinity
  }

  public setPixel(x: number, y: number, value: string): void {
    if (this.data[y] && this.data[y][x]) {
      this.data[y][x] = value
    }
  }

  public getSquare(x: number, y: number): string[] {
    const square: string[] = []
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        const pixel = this.getPixel(x + j, y + i)
        if (pixel) {
          square.push(pixel)
        }
      }
    }
    return square
  }

  public map(fn: (x: number, y: number) => string): Image {
    const image = this.clone()
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        image.setPixel(x, y, fn(x, y))
      }
    }
    return image
  }

  public clone(): Image {
    return new Image(
      this.data.map((row) => row.slice()),
      this.infinity,
    )
  }

  public toString(): string {
    return this.data.map((row) => row.join('')).join('\n')
  }

  public static fromString(str: string): Image {
    const input = str.split('\n').map((row) => row.split(''))
    const width = input[0].length
    const height = input.length
    const blankLine3 = DARK_PIXEL.repeat(width * 3).split('')
    const blankLine = DARK_PIXEL.repeat(width).split('')

    const imageData = []

    for (let y = 0; y < height; y++) {
      imageData.push(blankLine3)
    }

    for (let y = 0; y < height; y++) {
      imageData.push([...blankLine, ...input[y], ...blankLine])
    }

    for (let y = 0; y < height; y++) {
      imageData.push(blankLine3)
    }

    return new Image(imageData)
  }
}

const algorithm = new ImageEnhancementAlgorithm(algorithmInput)
const inputImage = Image.fromString(inputImageInput)

const enhanced1 = algorithm.enhanceImage(inputImage)
const enhanced2 = algorithm.enhanceImage(enhanced1)

console.log(inputImage.toString())
console.log('---------')
console.log(enhanced1.toString())
console.log('---------')
console.log(enhanced2.toString())

const lit = enhanced2.data.reduce((acc, row) => {
  return acc + row.filter((v) => v === LIGHT_PIXEL).length
}, 0)

console.log(`${lit} lit pixels`)
