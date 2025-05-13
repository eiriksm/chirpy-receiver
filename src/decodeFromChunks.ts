import { FFT } from "dsp.js";
import { Demodulator } from "./demodulator";
import { Decoder } from "./decoder";
const fftSize = 512;
const sampleRate = 44100;
const baseFreq = 2500;
const freqStep = 250;
const nFreqs = 9;

function getRawStringBlocksFromChunks(
  chunks: Array<Float32Array>,
  nSamples: number,
  clockRate: number = 32,
): string[] {
  // This is clockRate / 3 because it corresponds to the
  // tick_state->tick_compare = 3;
  // in the chirpy demo face.
  const toneRate = clockRate / 3;
  const fft = new FFT(fftSize, 44100);
  let dataOver = false;
  let chunkIx = 0,
    posInChunk = 0;
  const frame = new Float32Array(fftSize);
  const framesPerIter = 1000;
  const spectra: Array<Float32Array> = [];

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
      if (dataOver) {
        break
      }
      // Do FFT; save spectrum
      fft.forward(frame);
      const s = new Float32Array(fft.spectrum.length);
      for (let i = 0; i < s.length; ++i) {
        s[i] = fft.spectrum[i];
      }
      spectra.push(s);
    }
  }
  const demodulator = new Demodulator({
    sampleRate,
    fftSize,
    toneRate,
    baseFreq,
    freqStep,
    nFreqs,
  });

  const startMsec = demodulator.findStartMsec(spectra);
  if (startMsec == -1) {
    throw new Error("No start sequence found");
  }
  const tones: Array<number> = [];
  let tonePos = 0;
  const tonesPerIter = 500;
  const recLenMsec = Math.round((nSamples / sampleRate) * 1000);
  const results: Array<string> = [];

  while (tonePos * demodulator.toneLenMsec + 200 <= recLenMsec) {
    for (let tc = 0; tc < tonesPerIter; ++tc) {
      const msec = startMsec + tonePos * demodulator.toneLenMsec;

      if (msec + 200 > recLenMsec) {
        results.push(decodeTones(tones));
        return results;
      }

      const tone = demodulator.detecToneAt(spectra, msec);
      if (tone === -1) {
        ++tonePos;
        continue;
      }
      tones.push(tone);

      if (doesEndInEOM(tones, demodulator.symFreqs.length - 1)) {
        results.push(decodeTones(tones));
        return results;
      }

      ++tonePos;
    }
  }

  return results;
}


function doesEndInEOM(tones: number[], signalToneIx: number): boolean {
  if (tones.length < 3) return false;
  for (let i = 0; i < 3; ++i) {
    if (tones[tones.length - i - 1] !== signalToneIx) return false;
  }
  return true;
}

function decodeTones(tones: Array<number>) {
  // Decode, and display decoded blocks
  const decoder = new Decoder(tones);
  if (!decoder.valid) {
    throw new Error(
      "Message cannot be reconstructed: invalid CRC in one or more blocks.",
    );
  }
  const utf8Result = decoder.getUtf8();
  return utf8Result;
}

export { getRawStringBlocksFromChunks, decodeTones };
