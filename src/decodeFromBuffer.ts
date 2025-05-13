import { getRawStringBlocksFromChunks } from "./decodeFromChunks";

async function getRawStringBlocksFromBuffer(
  buffer: ArrayBuffer,
  clockRate: number = 32,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const audioCtx = new window.AudioContext();
    audioCtx.decodeAudioData(buffer, async (audioBuffer) => {
      const data = audioBuffer.getChannelData(0);
      const chunks = [];
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
      try {
        const blocks = await getRawStringBlocksFromChunks(
          chunks,
          nSamples,
          clockRate,
        );
        resolve(blocks);
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function getStringFromBuffer(
  buffer: ArrayBuffer,
  clockRate: number = 32,
): Promise<string> {
  const blocks = await getRawStringBlocksFromBuffer(buffer, clockRate);
  let str = "";
  for (const block of blocks) {
    const trimmed = block.trim();
    str += trimmed;
  }
  return str;
}

export { getRawStringBlocksFromBuffer, getStringFromBuffer };
