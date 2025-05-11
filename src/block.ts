class Block {
    public nTones;
    public startTonePos;
    public bytes;
    public ascii;
    public crc;
    public valid;
    private utf8;
    constructor(startTonePos, nTones, bytes, crc) {
      this.startTonePos = startTonePos;
      this.nTones = nTones;
      this.bytes = bytes;
      this.ascii = getAscii(bytes);
      this.crc = crc;
      this.valid = crc == getCRC8(bytes);
      this.utf8 = this.decodeUtf8(bytes);
    }
    decodeUtf8(bytes: Array<number>) {
      let str = ""
      try {
        const decoder = new TextDecoder("utf-8");
        str = decoder.decode(new Uint8Array(bytes));
      } catch (e) {
        console.log("Error decoding UTF-8: " + e);
      }
      return str;
    }
    getUtf8() {
      return this.utf8;
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
