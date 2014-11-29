var assert = require('assert');
var fs = require('fs');
var flownotate = require('../../src/flownotate');

function getFixture(name) {
    return fs.readFileSync(__dirname + '/../fixtures/' + name, 'utf8');
}

describe('flownotate', function() {

    describe('jsToJsx()', function() {

        it('transforms a simple function\'s param and return types', function() {
            var input = getFixture('simple-function/in.js');
            var expectedOutput = getFixture('simple-function/out.jsx');
            var actualOutput = flownotate.jsToJsx(input);
            assert.equal(expectedOutput, actualOutput);
        });

    });

});
