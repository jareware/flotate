/* @flow */
class Foo {
    /*:: map: { [key:string]: number }; */
    constructor(key /*: string */, val /*: number */) {
        this.map = {};
        this.map[key] = val;
    }
}
