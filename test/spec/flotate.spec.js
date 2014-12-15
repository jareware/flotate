var should = require('should'); // https://github.com/shouldjs/should.js#assertions
var fs = require('fs');
var flotate = require('../../src/flotate');

function getFixture(name) {
    return fs.readFileSync(__dirname + '/../fixtures/' + name, 'utf8');
}

describe('flotate', function() {

    describe('translateIncludePath()', function() {

        it('won\'t unnecessarily translate non-.. paths', function() {
            var sourceDir = '/Users/jara/Projects/foo/bar/src';
            var tempDir = '/var/folders/k0/vy40jfp93d538th2y4hkzt7c0000gp/T/flotate1141030-33313-s4izbj/flotate';
            var expectedPath = 'flow-interfaces/lodash.d.ts';
            var actualPath = flotate.translateIncludePath('flow-interfaces/lodash.d.ts', sourceDir, tempDir);
            actualPath.should.equal(expectedPath);
        });

        it('translates ..-relative paths correctly', function() {
            var sourceDir = '/Users/jara/Projects/foo/bar/src';
            var tempDir = '/var/folders/k0/vy40jfp93d538th2y4hkzt7c0000gp/T/flotate1141030-33313-s4izbj/flotate';
            var expectedPath = '../../../../../../../../Users/jara/Projects/foo/bar/contrib/flow-interfaces/lodash.d.ts';
            var actualPath = flotate.translateIncludePath('../contrib/flow-interfaces/lodash.d.ts', sourceDir, tempDir);
            actualPath.should.equal(expectedPath);
        });

    });

    describe('jsToFlow()', function() {

        it('function-return-type-only', function() {
            var input = getFixture('function-return-type-only.js');
            var expectedOutput = getFixture('function-return-type-only.ts');
            var actualOutput = flotate.jsToFlow(input);
            actualOutput.should.equal(expectedOutput);
        });

        it('function-argument-types-only', function() {
            var input = getFixture('function-argument-types-only.js');
            var expectedOutput = getFixture('function-argument-types-only.ts');
            var actualOutput = flotate.jsToFlow(input);
            actualOutput.should.equal(expectedOutput);
        });

        it('function-argument-and-return-types', function() {
            var input = getFixture('function-argument-and-return-types.js');
            var expectedOutput = getFixture('function-argument-and-return-types.ts');
            var actualOutput = flotate.jsToFlow(input);
            actualOutput.should.equal(expectedOutput);
        });

        it('transform-stability', function() {
            var input = getFixture('transform-stability.js');
            var expectedOutput = getFixture('transform-stability.ts');
            var actualOutput = flotate.jsToFlow(input);
            actualOutput.should.equal(expectedOutput);
        });

        it('return-module-object', function() {
            var input = getFixture('return-module-object.js');
            var expectedOutput = getFixture('return-module-object.ts');
            var actualOutput = flotate.jsToFlow(input);
            actualOutput.should.equal(expectedOutput);
        });

        it('typedefs', function() {
            var input = getFixture('typedefs.js');
            var expectedOutput = getFixture('typedefs.ts');
            var actualOutput = flotate.jsToFlow(input);
            actualOutput.should.equal(expectedOutput);
        });

        it('classes', function() {
            var input = getFixture('classes.js');
            var expectedOutput = getFixture('classes.ts');
            var actualOutput = flotate.jsToFlow(input);
            actualOutput.should.equal(expectedOutput);
        });

        it('ignores', function() {
            var input = getFixture('ignores.js');
            var expectedOutput = getFixture('ignores.ts');
            var actualOutput = flotate.jsToFlow(input);
            actualOutput.should.equal(expectedOutput);
        });

        it('whitespace', function() {
            var input = getFixture('whitespace.js');
            var expectedOutput = getFixture('whitespace.ts');
            var actualOutput = flotate.jsToFlow(input);
            actualOutput.should.equal(expectedOutput);
        });

    });

});
