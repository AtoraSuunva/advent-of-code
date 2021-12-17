import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const file = join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
const input = await fs.readFile(file, 'utf8')
const transmission = input.trim()

/** Parse a hex character into a binary string, padded to 4 bits */
function charToBinary(input: string): string {
  return parseInt(input, 16).toString(2).padStart(4, '0')
}

function toBinary(input: string): string {
  return input.split('').map(charToBinary).join('')
}

function parseIntFromBinary(
  input: string,
  offset = 0,
  length?: number,
): number {
  const end = length ?? input.length
  return parseInt(input.substring(offset, offset + end), 2)
}

class Packet<T> {
  static TYPE_ID = 0

  constructor(
    public version: number,
    public type: number,
    public data: T,
    public rawPacket: string,
  ) {}

  static VERSION_OFFSET = 0
  static VERSION_LENGTH = 3
  static TYPE_OFFSET = Packet.VERSION_OFFSET + Packet.VERSION_LENGTH
  static TYPE_LENGTH = 3
  static HEADER_LENGTH = Packet.TYPE_OFFSET + Packet.TYPE_LENGTH

  getValue(): number {
    throw new Error('Not implemented for packets')
  }

  getTotalVersion(): number {
    return this.version
  }

  toString() {
    return `(PCK v${this.version} t${this.type} [${this.data}])`
  }

  public static fromBinary(binary: string): Packet<string> {
    const version = parseIntFromBinary(
      binary,
      Packet.VERSION_OFFSET,
      Packet.VERSION_LENGTH,
    )

    const type = parseIntFromBinary(
      binary,
      Packet.TYPE_OFFSET,
      Packet.TYPE_LENGTH,
    )

    const data = binary.substring(Packet.TYPE_OFFSET + Packet.TYPE_LENGTH)

    return new Packet(version, type, data, binary)
  }

  public static fromHex(hex: string): Packet<string> {
    return Packet.fromBinary(toBinary(hex))
  }
}

class LiteralPacket extends Packet<number> {
  static override TYPE_ID = 4

  constructor(version: number, type: number, data: number, rawPacket: string) {
    super(version, type, data, rawPacket)
  }

  override getValue(): number {
    return this.data
  }

  override toString() {
    return `(LIT v${this.version} t${this.type} [${this.data}])`
  }

  static DATA_LENGTH = 5

  static fromPacket(packet: Packet<string>): LiteralPacket {
    const rawDataChunks: string[] = []

    for (let i = 0; i < packet.data.length; i += LiteralPacket.DATA_LENGTH) {
      rawDataChunks.push(
        packet.data.substring(i + 1, i + LiteralPacket.DATA_LENGTH),
      )
      // Last packet
      if (packet.data[i] === '0') {
        break
      }
    }

    const rawData = rawDataChunks.join('')
    const data = parseInt(rawData, 2)
    // Data chunks exclude the first "is this the last packet" bit
    const packetLength =
      Packet.HEADER_LENGTH + rawData.length + rawDataChunks.length

    return new LiteralPacket(
      packet.version,
      packet.type,
      data,
      packet.rawPacket.substring(0, packetLength),
    )
  }
}

class OperatorPacket extends Packet<Packet<unknown>[]> {
  constructor(
    version: number,
    type: number,
    data: Packet<unknown>[],
    rawPacket: string,
  ) {
    super(version, type, data, rawPacket)
  }

  override getTotalVersion(): number {
    return this.data.reduce(
      (acc, packet) => acc + packet.getTotalVersion(),
      this.version,
    )
  }

  override getValue(): number {
    switch (this.type) {
      case 0:
        return this.data.reduce((acc, packet) => acc + packet.getValue(), 0)
      case 1:
        return this.data.reduce((acc, packet) => acc * packet.getValue(), 1)
      case 2:
        return Math.min(...this.data.map((packet) => packet.getValue()))
      case 3:
        return Math.max(...this.data.map((packet) => packet.getValue()))
      case 5:
        return this.data[0].getValue() > this.data[1].getValue() ? 1 : 0
      case 6:
        return this.data[0].getValue() < this.data[1].getValue() ? 1 : 0
      case 7:
        return this.data[0].getValue() === this.data[1].getValue() ? 1 : 0
    }

    throw new Error(`Unknown operator type ${this.type}`)
  }

  override toString() {
    return `(OP  v${this.version} t${this.type} [${this.data}])`
  }

  static DATA_LENGTH = 1
  static TYPE_0_LENGTH = 15
  static TYPE_1_LENGTH = 11

  static fromPacket(packet: Packet<string>): OperatorPacket {
    const lengthType = parseInt(packet.data[0], 2)
    const packets = []
    const lengthTypeLength =
      lengthType === 0
        ? // Next 15 bits represent the total length in bits of the data
          OperatorPacket.TYPE_0_LENGTH
        : // Next 11 bits represent the number of sub-packets contained
          OperatorPacket.TYPE_1_LENGTH

    const length = parseIntFromBinary(
      packet.data,
      OperatorPacket.DATA_LENGTH,
      lengthTypeLength,
    )

    const data = packet.data.substring(
      OperatorPacket.DATA_LENGTH + lengthTypeLength,
    )
    let currentLength = 0

    while (
      lengthType === 0 ? currentLength < length : packets.length < length
    ) {
      const packet = Packet.fromBinary(data.substring(currentLength))

      if (packet.type === LiteralPacket.TYPE_ID) {
        const litPacket = LiteralPacket.fromPacket(packet)
        currentLength += litPacket.rawPacket.length
        packets.push(litPacket)
      } else {
        // Another operator packet
        const opPacket = OperatorPacket.fromPacket(packet)
        currentLength += opPacket.rawPacket.length
        packets.push(opPacket)
      }
    }

    const packetLength =
      Packet.HEADER_LENGTH +
      OperatorPacket.DATA_LENGTH +
      lengthTypeLength +
      currentLength

    return new OperatorPacket(
      packet.version,
      packet.type,
      packets,
      packet.rawPacket.substring(0, packetLength),
    )
  }
}

const parsed = Packet.fromHex(transmission)
const fullPacket =
  parsed.type === LiteralPacket.TYPE_ID
    ? LiteralPacket.fromPacket(parsed)
    : OperatorPacket.fromPacket(parsed)

console.log('\nResult:\n')
console.log(parsed)
console.dir(fullPacket, { depth: null })
console.log(fullPacket.getValue())
