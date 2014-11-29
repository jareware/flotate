var fs = require('fs');
var flownotate = require('./flownotate');

var file = fs.readFileSync('test/fixtures/simple-function/in.js', 'utf8');

console.log(flownotate.jsToJsx(file));
