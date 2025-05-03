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


function getAscii(bytes) {
    let res = "";
    for (const b of bytes) {
      res += String.fromCodePoint(b);
    }
    return res;
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

export { Block }
