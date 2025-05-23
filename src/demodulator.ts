import { ToneStencil } from "./toneStencil";

class Demodulator {
  public sampleLenMsec;
  public bitSize;
  public stencils: Array<ToneStencil>;
  public sampleRate;
  public fftSize;
  public toneRate;
  public toneLenMsec;
  public symFreqs;

  constructor({ sampleRate, fftSize, toneRate, baseFreq, freqStep, nFreqs }) {
    const bitSize = Math.log(nFreqs - 1) / Math.log(2);
    if (bitSize != Math.round(bitSize)) {
      throw "nFreqs must be 2^x+1, e.g., 5, 9 or 17";
    }

    this.bitSize = bitSize;
    this.sampleRate = sampleRate;
    this.fftSize = fftSize;
    this.toneRate = toneRate;
    this.sampleLenMsec = (this.fftSize / this.sampleRate) * 1000;
    this.toneLenMsec = 1000 / this.toneRate;

    this.symFreqs = [];
    for (let i = 0; i < nFreqs; ++i)
      this.symFreqs.push(baseFreq + freqStep * i);

    this.stencils = [];
    for (const freq of this.symFreqs)
      this.stencils.push(new ToneStencil(freq, sampleRate, fftSize));
  }

  detecToneAt(spectra, msec): number {
    const ixAt = Math.round(msec / this.sampleLenMsec);
    const tone0 = detectTone(spectra[ixAt - 1], this.stencils);
    const tone1 = detectTone(spectra[ixAt], this.stencils);
    const tone2 = detectTone(spectra[ixAt + 1], this.stencils);
    if (tone0 == tone1 || tone0 == tone2) return tone0;
    if (tone1 == tone2) return tone1;
    return -1;
  }

  findStartMsec(spectra: Array<Float32Array>): number {
    let firstMatchIx: number = -1;
    let lastMatchIx: number = -1;
    for (let ix0 = 0; ix0 < spectra.length; ++ix0) {
      const msec0 = ix0 * this.sampleLenMsec;
      const ix1 = Math.round((msec0 + this.toneLenMsec) / this.sampleLenMsec);
      const ix2 = Math.round(
        (msec0 + 2 * this.toneLenMsec) / this.sampleLenMsec,
      );
      const ix3 = Math.round(
        (msec0 + 3 * this.toneLenMsec) / this.sampleLenMsec,
      );
      if (ix3 > spectra.length - 1) {
        break;
      }
      const tone0 = detectTone(spectra[ix0], this.stencils);
      const tone1 = detectTone(spectra[ix1], this.stencils);
      const tone2 = detectTone(spectra[ix2], this.stencils);
      const tone3 = detectTone(spectra[ix3], this.stencils);
      if (
        tone0 == this.symFreqs.length - 1 &&
        tone1 == 0 &&
        tone2 == this.symFreqs.length - 1 &&
        tone3 == 0
      ) {
        // Reset first match if too much time has passed. Let's say 100ms
        if (firstMatchIx != -1 && ix0 - firstMatchIx > 100) {
          console.log("reset firstMatchIx");
          firstMatchIx = -1;
          lastMatchIx = -1;
        }
        if (firstMatchIx == -1) {
          firstMatchIx = ix0;
        } else {
          lastMatchIx = ix0;
        }
      } else if (firstMatchIx != -1 && lastMatchIx != -1) {
        break;
      }
    }

    if (firstMatchIx == -1) {
      return -1;
    }
    const midMatchIx = Math.round((firstMatchIx + lastMatchIx) / 2);
    return Math.floor(midMatchIx * this.sampleLenMsec);
  }
}

function detectTone(spectrum, stencils) {
  const v1 = new Float32Array(stencils.length);

  for (let i = 0; i < v1.length; ++i) v1[i] = 0;

  for (let i = 0; i < v1.length; ++i) v1[i] = 0;

  // At each position, sum up values in spectrum from the slots defined by the stencil
  // This is the strength of each tone as viewed through the stencil
  for (let toneIx = 0; toneIx < stencils.length; ++toneIx) {
    const stencil = stencils[toneIx];
    for (const binIx of stencil.bins) v1[toneIx] += spectrum[binIx];
  }

  // Find index of strongest tone
  let maxVal = Number.MIN_VALUE,
    maxIx = -1;
  for (let i = 0; i < v1.length; ++i) {
    if (v1[i] > maxVal) {
      maxVal = v1[i];
      maxIx = i;
    }
  }

  // Sum up other values
  let restSum = 0;
  for (let i = 0; i < v1.length; ++i) {
    if (i != maxIx) {
      restSum += v1[i];
    }
  }

  // Check if highest band is sufficiently stronger than others
  const ratio = maxVal / restSum;
  if (ratio >= 0.1) return maxIx;
  else return -1;
}

export { Demodulator };
