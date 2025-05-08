import { getRawStringBlocksFromChunks } from './decodeFromChunks';

async function getRawStringBlocksFromBuffer(buffer: ArrayBuffer) : Promise<string[]> {
  return new Promise((resolve, reject) => {
    const audioCtx = new window.AudioContext();
    audioCtx.decodeAudioData(buffer, async (audioBuffer) => {
        const data = audioBuffer.getChannelData(0);
        let chunks = [];
        const nSamples = data.length;
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
        const blocks = await getRawStringBlocksFromChunks(chunks, nSamples);
        resolve(blocks);
    })
  })
}

async function getStringFromBuffer(buffer: ArrayBuffer) : Promise<string> {
  const blocks = await getRawStringBlocksFromBuffer(buffer);
  let str = "";
  for (const block of blocks) {
      let trimmed = block.trim();
      str += trimmed;
  }
  return str;
}

export { getRawStringBlocksFromBuffer, getStringFromBuffer }
