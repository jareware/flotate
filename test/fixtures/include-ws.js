/* @flow */
/* flow-include type FooBar = { id: number } */
function foo(x /*: FooBar */) /*: boolean */ {
    return x.id * 5 === 5;
}
foo({ id: 123 });
