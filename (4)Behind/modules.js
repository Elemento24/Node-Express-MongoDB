// console.log(arguments);
// console.log(require('module').wrapper);

// module.exports
const C = require('./test-module-1');
const calc1 = new C();
console.log(calc1.add(2, 5));

// exports
// const calc2 = require('./test-module-2');
const { add, multiply, divide } = require('./test-module-2');
console.log(add(2, 5));
console.log(multiply(2, 5));
console.log(divide(2, 5));

// Caching -> The module gets loaded only once, and then it gets stored in the Cache. That is the top-level code inside any module gets executed only once.
require('./test-module-3')();
require('./test-module-3')();
require('./test-module-3')();