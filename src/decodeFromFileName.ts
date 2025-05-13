import { readFileSync } from "fs";

import { WaveFile } from "wavefile";
import { getRawStringBlocksFromChunks } from "./decodeFromChunks";

const sampleRate = 44100;

async function getStringFromFileName(
  file: string,
  clockRate: number = 32,
): Promise<string> {
  const blocks = await getRawStringBlocksFromFileName(file, clockRate);
  let str = "";
  for (const block of blocks) {
    const trimmed = block.trim();
    str += trimmed;
  }
  return str;
}

async function getRawStringBlocksFromFileName(
  file: string,
  clockRate: number = 32,
): Promise<string[]> {
  const buffer = readFileSync(file);
  const wav = new WaveFile(buffer);
  wav.toBitDepth("32f");
  wav.toSampleRate(sampleRate);
  // Here we are trying to trick the typescript compiler. It's gonna complain
  // about the wav.getSamples() method not returning an array of Float64Array.
  // In addition, if we pass a const to wav[method] it will do the same.
  const methodSubject = "Samples";
  const audioData: Array<Float64Array> = wav["get" + methodSubject]();
  const data = audioData[0];
  const chunks = [];
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
  const nSamples: number = data.length;
  return await getRawStringBlocksFromChunks(chunks, nSamples, clockRate);
}

export { getRawStringBlocksFromFileName, getStringFromFileName };
