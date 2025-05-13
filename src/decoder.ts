import { Block } from "./block";

const toneBits = [
  [0, 0, 0],
  [0, 0, 1],
  [0, 1, 0],
  [0, 1, 1],
  [1, 0, 0],
  [1, 0, 1],
  [1, 1, 0],
  [1, 1, 1],
];

class Decoder {
  public tones;
  public bytes;
  public valid;
  public ascii;
  public blocks: Array<Block>;
  constructor(tones: Array<number>) {
    this.tones = tones;
    this.blocks = decode(tones);
    this.bytes = catBytes(this.blocks);
    this.ascii = catAscii(this.blocks);
    this.valid = true;
    for (const block of this.blocks) if (!block.valid) this.valid = false;
  }
  public getUtf8() {
    let str = "";
    for (const block of this.blocks) {
      str += block.getUtf8();
    }
    return str;
  }
}

function decode(tones: Array<number>) {
  const blocks: Array<Block> = [];
  // Single-byte transmission is 14 tones
  if (tones.length < 14) return blocks;
  // Start sequence
  if (tones[0] != 8 || tones[1] != 0 || tones[2] != 8 || tones[3] != 0)
    return blocks;
  // Go block by block
  let ix = 4;
  while (true) {
    const endIx = getBlockEndIx(tones, ix);
    if (endIx == -1) break;
    const block = decodeBlock(tones.slice(ix, endIx));
    block.startTonePos = ix;
    block.nTones = endIx - ix;
    blocks.push(block);
    ix = endIx;
  }
  return blocks;
}

function decodeBlock(tones: Array<number>) {
  const bits: Array<number> = [];
  for (let i = 0; i < tones.length - 5; ++i) {
    bits.push(...getToneBits(tones[i]));
  }
  const crcBits = [
    ...getToneBits(tones[tones.length - 4]),
    ...getToneBits(tones[tones.length - 3]),
    ...getToneBits(tones[tones.length - 2]),
  ];
  const bytes = getBytes(bits);
  const crcBytes = getBytes(crcBits);
  return new Block(0, 0, bytes, crcBytes[0]);
}

function getToneBits(tone) {
  // For wrong tones (interim 8s): don't crash
  // We hope that CRC will catch this
  return toneBits[tone % 8];
}

function catBytes(blocks) {
  const bytes = [];
  for (const block of blocks) {
    bytes.push(...block.bytes);
  }
  return bytes;
}

function catAscii(blocks) {
  let str = "";
  for (const block of blocks) {
    str += block.ascii;
  }
  return str;
}

function getBlockEndIx(tones: Array<number>, startIx: number) {
  // Find next 8NNN8
  for (let i = startIx + 4; i < tones.length; ++i) {
    if (tones[i] == 8 && tones[i - 4] == 8) {
      return i + 1;
    }
  }
  return -1;
}

function getBytes(bits) {
  const res = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let val = 0;
    for (let j = 0; j < 8; ++j) {
      val <<= 1;
      val += bits[i + j];
    }
    res.push(val);
  }
  return res;
}

export { Decoder };
