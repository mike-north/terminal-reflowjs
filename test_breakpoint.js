const { wrapString } = require('./dist/wordwrap.js');
console.log("Result:", JSON.stringify(wrapString("foo-barbaz", 8)));
