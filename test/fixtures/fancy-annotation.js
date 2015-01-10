/* @flow */

/* : (x: string, y: number): boolean */
function foo(x, y) {
    return x.length * y === 5;
}
foo('Hello', 42);
