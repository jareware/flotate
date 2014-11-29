/* @flow */
function foo(x, y) /*: boolean */ {
    return x.length * y === 5;
}
foo('Hello', 42);
