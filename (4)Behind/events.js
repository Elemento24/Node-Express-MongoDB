const EventEmitter = require('events');
const http = require('http');

// class Sales extends EventEmitter {
//   constructor() {
//     super();
//   }
// }

// const myEmitter = new Sales();

// myEmitter.on('newSale', () => {
//   console.log('There was a New Sale!');
// });
// myEmitter.on('newSale', () => {
//   console.log('Jonas is the new Consumer!');
// });
// myEmitter.on('newSale', stock => {
//   console.log(`There are now ${stock} items left in the Stock!`);
// });

// myEmitter.emit('newSale', 9);

// =======================================

const server = http.createServer();

server.on('request', (req, res) => {
  console.log('Request received!');
  res.end('Request received!');
});

server.on('request', (req, res) => {
  console.log('Another request!');
});

server.on('close', () => {
  console.log('Served Closed!');
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Waiting for requests....');
});

