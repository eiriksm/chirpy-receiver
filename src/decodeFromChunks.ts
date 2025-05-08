import { FFT } from "dsp.js"
import { Demodulator } from "./demodulator";
import { Decoder } from "./decoder";
const fftSize = 512;
const sampleRate = 44100;
const clockRate = 32;
const toneRate = clockRate/3;
const baseFreq = 2500;
const freqStep = 250;
const nFreqs = 9;


function getRawStringBlocksFromChunks(chunks: Array<any>, nSamples: number) : string[] {
    var fft = new FFT(fftSize, 44100);
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
    if (startMsec == -1) {
        alert("No message found.")
        alert("No Start-Of-Message sequence detected. Cannot decode transmission.");
        return [];
    }
    var tones: Array<number> = [];
    let tonePos = 0;
    const tonesPerIter = 500;
    const recLenMsec = Math.round(nSamples / sampleRate * 1000);
    let results: Array<string> = [];
    demodulateSome();

    function demodulateSome() {
        for (let tc = 0; tc < tonesPerIter; ++tc) {
            const msec = startMsec + tonePos * demodulator.toneLenMsec;
            if (msec + 200 > recLenMsec) {
                results.push(decodeTones(tones));
                return;
            }
            const tone = demodulator.detecToneAt(spectra, msec);
            tones.push(tone);
            if (doesEndInEOM(tones, demodulator.symFreqs.length - 1)) {
                results.push(decodeTones(tones));
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




  function decodeTones(tones) {
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

    if (!decoder.valid) {
      console.log("Message cannot be reconstructed: invalid CRC in one or more blocks.");
      return;
    }
    return decoder.ascii;
  }

  export { getRawStringBlocksFromChunks }
