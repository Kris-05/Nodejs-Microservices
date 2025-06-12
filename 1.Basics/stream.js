const fs = require("fs");
const zlib = require("zlib");
const crypto = require("crypto");
const { Transform } = require("stream");

class EncryptStream extends Transform {
  constructor(key, iv) {
    super();
    this.key = key;
    this.iv = iv;
  }

  _transform(chunk, encoding, callback) {
    const cipher = crypto.createCipheriv("aes-256-cbc", this.key, this.iv);
    // buffer is concatenated for each chunk of data
    const encrypted = Buffer.concat([cipher.update(chunk), cipher.final()]);
    this.push(encrypted);
    callback();
  }
}

const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const readableStream = fs.createReadStream('inp.txt');

// new gzip obj to compress the stream of data
const gzipStream = zlib.createGzip();
const encryptStream = new EncryptStream(key, iv);

const writableStream = fs.createWriteStream('op.txt.gz.enc');

// read -> compress -> encrypt -> write
readableStream.pipe(gzipStream).pipe(encryptStream).pipe(writableStream);

console.log(`Streaming -> compresing -> writing data`);

