/* @flow */
var Foo;
Foo = (function() {
  function Foo() {}

  

  Foo.prototype.instanceMember = function (x: string, y: number): boolean {
      return x.length * y === 5;
  };

  

  Foo.classMember = function (x: string, y: number): boolean {
      return x.length * y === 5;
  };
});

var f = new Foo();
f.member('Hello', 42);
Foo.classMember('Hello', 42);
