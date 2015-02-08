/* @flow */

var foo = function (x: string, y: number): boolean {
    return x.length * y === 5;
}
foo('Hello', 42);
