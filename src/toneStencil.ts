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


export { ToneStencil }
