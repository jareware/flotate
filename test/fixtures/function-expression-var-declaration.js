/* @flow */
/*: (x: string, y: number): boolean */
var foo = function(x, y) {
    return x.length * y === 5;
}
foo('Hello', 42);
