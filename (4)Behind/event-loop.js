const fs = require('fs');
const crypto = require('crypto');

const start = Date.now();
process.env.UV_THREADPOOL_SIZE = 4;

setTimeout(() => { console.log('Timer 1 finished!') }, 0);
setImmediate(() => console.log('Immediate One Finished'));

fs.readFile('./test-file.txt', () => {
  console.log('I/O Finished!');
  console.log('--------------------');

  setTimeout(() => { console.log('Timer 2 finished!') }, 0);
  setTimeout(() => { console.log('Timer 3 finished!') }, 3000);
  setImmediate(() => console.log('Immediate Two Finished'));

  process.nextTick(() => console.log('Process.nextTick'));

  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log(Date.now() - start, 'Password Encrypted');
  });
  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log(Date.now() - start, 'Password Encrypted');
  });
  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log(Date.now() - start, 'Password Encrypted');
  });
  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log(Date.now() - start, 'Password Encrypted');
  });
});

console.log('Top Level Code');