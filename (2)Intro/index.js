const fs = require('fs');   // fs stands for FILE SYSTEM
const http = require('http');   // http heps us to build a SERVER
const url = require('url');
const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

// =======
// FILES
// =======

// // Blocking, Synchronous Way
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);
// const textOut = `This is what we know about the Avocado: ${textIn}.\nCreated in ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
// console.log('File Written!');

// // Non-Blocking, Asynchronous Way
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//   if (err) return console.log('ERROR!');

//   fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//     console.log(data2);
//     fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//       console.log(data3);

//       fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
//         console.log('FILE HAS BEEN WRITTEN!');
//       });
//     });
//   });
// });
// console.log('FILE READING...');

// ========
// SERVER
// ========

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map(el => slugify(el.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {

  const { query, pathname } = url.parse(req.url, true);

  // Overview Page
  if (pathname === '/overview' || pathname === '/') {
    res.writeHead(200, {
      'Content-type': 'text/html'
    });

    const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('')
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

    res.end(output);
  }

  // Product Page
  else if (pathname === '/product') {
    res.writeHead(200, {
      'Content-type': 'text/html'
    });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);
  }

  // API
  else if (pathname === '/api') {
    res.writeHead(200, {
      'Content-type': 'application/json'
    });
    res.end(data);
  }

  // Not Found
  else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'Hello World!'
    });
    res.end('<h1>Page Not Found</h1>');
  }

});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000!');
});