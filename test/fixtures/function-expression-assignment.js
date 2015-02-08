/* @flow */
var foo;
/*: (x: string, y: number): boolean */
foo = function(x, y) {
    return x.length * y === 5;
}
foo('Hello', 42);
