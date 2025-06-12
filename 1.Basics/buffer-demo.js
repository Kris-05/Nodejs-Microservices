const buffOne = Buffer.alloc(10); // allocate a buufer of 10B -> all 0s
console.log(buffOne);

const buffTwo = Buffer.from("Hello"); // buffer from string
console.log(buffTwo);

buffOne.write('Node.js');
console.log(buffOne);

// concat 2 buffers
const concatBuff = Buffer.concat([buffOne, buffTwo]);
console.log(concatBuff);
console.log(concatBuff.toJSON());

