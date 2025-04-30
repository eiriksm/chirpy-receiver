import { FFT } from "dsp.js"
import { readFileSync } from "fs";
import { start } from "repl";
const fftSize = 512;
const sampleRate = 44100;
const clockRate = 32;
const toneRate = clockRate/3;
const baseFreq = 2500;
const freqStep = 250;
const nFreqs = 9;

import { WaveFile } from 'wavefile';



class Block {
    public nTones;
    public startTonePos;
    public bytes;
    public ascii;
    public crc;
    public valid;
    constructor(startTonePos, nTones, bytes, crc) {
      this.startTonePos = startTonePos;
      this.nTones = nTones;
      this.bytes = bytes;
      this.ascii = getAscii(bytes);
      this.crc = crc;
      this.valid = crc == getCRC8(bytes);
    }
  }
class Decoder {
    public tones;
    public bytes;
    public valid;
    public ascii;
    public blocks;
    constructor(tones) {
      this.tones = tones;
      this.blocks = decode(tones);
      this.bytes = catBytes(this.blocks);
      this.ascii = catAscii(this.blocks);
      this.valid = true;
      for (const block of this.blocks)
        if (!block.valid)
          this.valid = false;
    }
  }

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


  function getAscii(bytes) {
    let res = "";
    for (const b of bytes) {
      res += String.fromCodePoint(b);
    }
    return res;
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


function getCRC8(bytes) {

    let crc = 0;
    for (const b of bytes)
      crc = updateCRC(b, crc);
    return crc;

    function updateCRC(nextByte, crc) {
      for (let j = 0; j < 8; j++) {
        let mix = (crc ^ nextByte) & 0x01;
        crc >>= 1;
        if (mix)
          crc ^= 0x8C;
        nextByte >>= 1;
      }
      return crc;
    }
  }



async function main() {
    var fft = new FFT(fftSize, 44100);
    // Load the wav file we have, and convert it to a Float32Array
    const file = 'tests/assets/1.wav'
    const buffer = readFileSync(file);
    let wav = new WaveFile(buffer)
    wav.toBitDepth('32f'); // Pipeline expects input as a Float32Array
    wav.toSampleRate(sampleRate);
    let method = 'getSamples'
    let audioData : Array<Float64Array> = wav[method]();
    let data = audioData[0];
    let chunks = [];
    let pos = 0;
    while (pos < data.length) {
        const chunkSize = Math.min(4096, data.length - pos);
        const chunk = new Float32Array(chunkSize);
        for (let i = 0; i < chunkSize; ++i) {
            chunk[i] = data[pos + i];
        }
        chunks.push(chunk);
        pos += chunkSize;
    }

    let dataOver = false;
    let chunkIx = 0, posInChunk = 0;
    const frame = new Float32Array(fftSize);
    const framesPerIter = 1000;
    let spectra = [];

    // Process several FFT rounds
    while (!dataOver) {
        for (let fc = 0; fc < framesPerIter && !dataOver; ++fc) {
            // Gather data for this FFT round
            for (let i = 0; i < fftSize; ++i) {
              if (posInChunk == chunks[chunkIx].length) {
                posInChunk = 0;
                chunkIx += 1;
              }
              if (chunkIx == chunks.length) {
                dataOver = true;
                break;
              }
              frame[i] = chunks[chunkIx][posInChunk];
              ++posInChunk;
            }
            if (dataOver) break;
            // Do FFT; save spectrum
            fft.forward(frame);
            let s = new Float32Array(fft.spectrum.length);
            for (let i = 0; i < s.length; ++i) s[i] = fft.spectrum[i];
            spectra.push(s);
          }
    }
    const demodulator = new Demodulator({
        sampleRate,
        fftSize,
        toneRate,
        baseFreq,
        freqStep,
        nFreqs});

    const startMsec = demodulator.findStartMsec(spectra);
    console.log(startMsec);
    if (startMsec == -1) {
        console.log("No message found.")
        console.log("No Start-Of-Message sequence detected. Cannot decode transmission.");
        return;
    }
    var tones = [];
    let tonePos = 0;
    const tonesPerIter = 500;
    const nSamples = data.length;
    const recLenMsec = Math.round(nSamples / sampleRate * 1000);
    let results = [];
    demodulateSome();
    console.log(results)

    function demodulateSome() {
        for (let tc = 0; tc < tonesPerIter; ++tc) {
        const msec = startMsec + tonePos * demodulator.toneLenMsec;
        if (msec + 200 > recLenMsec) {
            results.push(decodeTones(startMsec, null, tones));
            return;
        }
        const tone = demodulator.detecToneAt(spectra, msec);
        tones.push(tone);
        if (doesEndInEOM(tones, demodulator.symFreqs.length - 1)) {
            results.push(decodeTones(startMsec, msec, tones));
            return;
        }
        ++tonePos;
        }
        demodulateSome();
    }

    function doesEndInEOM(tones, signalToneIx) {
        if (tones.length < 3) return false;
        for (let i = 0; i < 3; ++i) {
        if (tones[tones.length - i - 1] != signalToneIx) return false;
        }
        return true;
    }
    return results;
}


class Demodulator {
    public sampleLenMsec;
    public bitSize;
    public stencils;
    public sampleRate;
    public fftSize;
    public toneRate;
    public toneLenMsec;
    public symFreqs;

    constructor({sampleRate, fftSize, toneRate, baseFreq, freqStep, nFreqs}) {

      const bitSize = Math.log(nFreqs - 1) / Math.log(2);
      if (bitSize != Math.round(bitSize))
        throw "nFreqs must be 2^x+1, e.g., 5, 9 or 17";

      this.bitSize = bitSize;
      this.sampleRate = sampleRate;
      this.fftSize = fftSize;
      this.toneRate = toneRate;
      this.sampleLenMsec = this.fftSize / this.sampleRate * 1000;
      this.toneLenMsec = 1000 / this.toneRate;

      this.symFreqs = [];
      for (let i = 0; i < nFreqs; ++i)
        this.symFreqs.push(baseFreq + freqStep * i);

      this.stencils = [];
      for (const freq of this.symFreqs)
        this.stencils.push(new ToneStencil(freq, sampleRate, fftSize));
    }

    detecToneAt(spectra, msec) {
      const ixAt = Math.round(msec / this.sampleLenMsec);
      const tone0 = detectTone(spectra[ixAt-1], this.stencils);
      const tone1 = detectTone(spectra[ixAt], this.stencils);
      const tone2 = detectTone(spectra[ixAt+1], this.stencils);
      if (tone0 == tone1 || tone0 == tone2) return tone0;
      if (tone1 == tone2) return tone1;
      return -1;
    }

    findStartMsec(spectra) {

      let firstMatchIx = -1, lastMatchIx = -1;
      for (let ix0 = 0; ix0 < spectra.length; ++ix0) {
        const msec0 = ix0 * this.sampleLenMsec;
        const ix1 = Math.round((msec0 + this.toneLenMsec) / this.sampleLenMsec);
        const ix2 = Math.round((msec0 + 2 * this.toneLenMsec) / this.sampleLenMsec);
        const ix3 = Math.round((msec0 + 3 * this.toneLenMsec) / this.sampleLenMsec);
        if (ix3 > spectra.length - 1) break;
        const tone0 = detectTone(spectra[ix0], this.stencils);
        const tone1 = detectTone(spectra[ix1], this.stencils);
        const tone2 = detectTone(spectra[ix2], this.stencils);
        const tone3 = detectTone(spectra[ix3], this.stencils);
        if (tone0 == this.symFreqs.length - 1 && tone1 == 0 &&
            tone2 == this.symFreqs.length - 1 && tone3 == 0) {
          if (firstMatchIx == -1) {
            firstMatchIx = lastMatchIx = ix0;
          }
          else lastMatchIx = ix0;
        }
        else if (firstMatchIx != -1) break;
      }

      if (firstMatchIx == -1) return -1;
      const midMatchIx = Math.round((firstMatchIx + lastMatchIx) / 2);
      return Math.floor(midMatchIx * this.sampleLenMsec);
    }

  }

  class ToneStencil {
    public freq;
    public bins;
    constructor(freq, sampleRate, fftSize) {
      this.freq = freq;
      this.bins = getBins(freq, sampleRate, fftSize, true);
    }
  }


function getBins(freq, sampleRate, fftSize, multiple = false) {
    const bandwidth = sampleRate / fftSize;
    let midIx = -1;
    for (let i = 0; i < fftSize / 2; ++i) {
      if (freq > i * bandwidth && freq <= (i+1) * bandwidth) {
        midIx = i;
        break;
      }
    }
    if (multiple) return [midIx - 1, midIx, midIx + 1];
    else return [midIx];
  }

  var v1 = null;
  function detectTone(spectrum, stencils) {

    if (!v1 || v1.length != stencils.length)
      v1 = new Float32Array(stencils.length);

    for (let i = 0; i < v1.length; ++i) v1[i] = 0;

    // At each position, sum up values in spectrum from the slots defined by the stencil
    // This is the strength of each tone as viewed through the stencil
    for (let toneIx = 0; toneIx < stencils.length; ++toneIx) {
      const stencil = stencils[toneIx];
      for (const binIx of stencil.bins)
        v1[toneIx] += spectrum[binIx];
    }

    // Find index of strongest tone
    let maxVal = Number.MIN_VALUE, maxIx = -1;
    for (let i = 0; i < v1.length; ++i) {
      if (v1[i] > maxVal) {
        maxVal = v1[i];
        maxIx = i;
      }
    }

    // Sum up other values
    let restSum = 0;
    for (let i = 0; i < v1.length; ++i) {
      if (i != maxIx)
        restSum += v1[i];
    }

    // Check if highest band is sufficiently stronger than others
    let ratio = maxVal / restSum;
    if (ratio >= 0.1) return maxIx;
    else return -1;
  }

main()


function decodeTones(startMsec, endMsec, tones) {
    const startSecStr = (startMsec / 1000).toFixed(2);
    if (!endMsec) {
      console.log(`<p>Start of message: ${startSecStr}<br/>No End-Of-Message sequence detected</p>`);
    }
    else {
      const endSecStr = (endMsec / 1000).toFixed(2);
      console.log(`<p>Start of message: ${startSecStr}<br/>End of message: ${endSecStr}</p>`);
    }
    // Display tones
    let tonesStr = "";
    for (const t of tones) {
      if (tonesStr != "") tonesStr += " ";
      tonesStr += t;
    }

    // Decode, and display decoded blocks
    let decoder = new Decoder(tones);
    let blocksHtml = "";
    for (let i = 0; i < decoder.blocks.length; ++i) {
      const block = decoder.blocks[i];
      if (block.valid) blocksHtml += `<span class='valid'>Block ${i} VALID</span>`;
      else blocksHtml += `<span class='invalid'>Block ${i} INVALID</span>`;
      blocksHtml += "\nTones:";
      for (let j = block.startTonePos; j < block.startTonePos + block.nTones; ++j)
        blocksHtml += " " + tones[j];
      blocksHtml += "\nBytes:";
      let blocksAscii = "";
      for (const b of block.bytes) {
        let hex = "0x" + b.toString(16).padStart(2, "0");
        blocksHtml += " " + hex;
        const hexObj = parseInt(hex, 16)
        blocksAscii += String.fromCharCode(hexObj)
      }

      blocksHtml += "\nASCII:";
      blocksHtml += blocksAscii;

      blocksHtml += "\nCRC: 0x" + block.crc.toString(16).padStart(2, "0") + "\n\n";
    }
    console.log(blocksHtml);

    if (!decoder.valid) {
      console.log("Message cannot be reconstructed: invalid CRC in one or more blocks.");
      return;
    }
    console.log("Message successfully decoded.");
    return decoder.ascii;
  }




function decode(tones) {
    const blocks = [];
    // Single-byte transmission is 14 tones
    if (tones.length < 14) return blocks;
    // Start sequence
    if (tones[0] != 8 || tones[1] != 0 || tones[2] != 8 || tones[3] != 0) return blocks;
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

function getBlockEndIx(tones, startIx) {
    // Find next 8NNN8
    for (let i = startIx + 4; i < tones.length; ++i) {
      if (tones[i] == 8 && tones[i -4] == 8) {
        return i + 1;
      }
    }
    return -1;
  }

function decodeBlock(tones) {
    const bits = [];
    for (let i = 0; i < tones.length - 5; ++i)
      bits.push(...getToneBits(tones[i]));
    const crcBits = [
      ...getToneBits(tones[tones.length-4]),
      ...getToneBits(tones[tones.length-3]),
      ...getToneBits(tones[tones.length-2]),
    ];
    const bytes = getBytes(bits);
    const crcBytes = getBytes(crcBits);
    return new Block(start, 0, bytes, crcBytes[0]);
  }


function getToneBits(tone) {
    // For wrong tones (interim 8s): don't crash
    // We hope that CRC will catch this
    return toneBits[tone % 8];
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

  // Export the main function.
    export { main };
