/* @flow */
var Foo;
Foo = (function() {
  function Foo() {}

  /*: (x: string, y: number): boolean */

  Foo.prototype.instanceMember = function(x, y) {
      return x.length * y === 5;
  };

  /*: (x: string, y: number): boolean */

  Foo.classMember = function(x, y) {
      return x.length * y === 5;
  };
});

var f = new Foo();
f.member('Hello', 42);
Foo.classMember('Hello', 42);
