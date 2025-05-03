import { readFileSync } from "fs";

import { WaveFile } from 'wavefile';
import { getRawStringBlocksFromChunks } from './decodeFromChunks';

const sampleRate = 44100;




async function getStringFromFileName(file: string) : Promise<string> {
    const blocks = await getRawStringBlocksFromFileName(file);
    let str = "";
    for (const block of blocks) {
        let trimmed = block.trim();
        str += trimmed;
    }
    return str;
}

async function getRawStringBlocksFromFileName(file: string) : Promise<string[]> {
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
    const nSamples : number = data.length;
    return await getRawStringBlocksFromChunks(chunks, nSamples);
}

export { getRawStringBlocksFromFileName, getStringFromFileName };
