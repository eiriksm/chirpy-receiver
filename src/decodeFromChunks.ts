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
    let spectra : Array<Float32Array> = [];

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



  function decodeTones(tones: Array<number>) {
    // Decode, and display decoded blocks
    let decoder = new Decoder(tones);
    if (!decoder.valid) {
      throw new Error("Message cannot be reconstructed: invalid CRC in one or more blocks.");
    }
    const utf8Result = decoder.getUtf8();
    return utf8Result;
  }

  export { getRawStringBlocksFromChunks }
