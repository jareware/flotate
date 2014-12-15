/* @flow */
class Foo {
    
        map: { [key:string]: number };
    
    constructor(key : string, val : 
        
        number
        
        ) { // all kinds of weird whitespace has to be allowed for, so that line numbers always match
        this.map = {};
        this.map[key] = val;
    }
}
