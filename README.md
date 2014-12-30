# flotate

> A portmanteau of **flo**w and anno**tate**, allows using the [Flow](http://flowtype.org/) type checker with standard JavaScript syntax, through inline annotations

[![Build Status](https://travis-ci.org/jareware/flotate.svg?branch=master)](https://travis-ci.org/jareware/flotate)

## tl;dr

[Flow](http://flowtype.org/) implements many useful type checks, but also requires you to opt into a custom JavaScript syntax. This in turn makes it hard to use many other useful tools (such as linters, preprocessors etc) which assume standards compliant JavaScript. So instead of writing:

```typescript
/* @flow */
function foo(x: string, y: number): string {
    return x.length * y;
}
foo('Hello', 42);
```

You can add the same type annotations with inline comments:

```javascript
/* @flow */
function foo(x /*: string */, y /*: number */) /*: string */ {
    return x.length * y;
}
foo('Hello', 42);
```

It's win-some-lose-some: you lose by having to type a bit more, but win by keeping your code more interoperable.

## Annotations

`flotate` defines 4 annotation types:

 * `/*: whatever */` which translates to `: whatever`. This is by far the most common annotation you'll need, as it's the syntax Flow uses for [function arguments, return values](http://flowtype.org/docs/type-annotations.html#_) and [variables](http://flowtype.org/docs/variables.html#_).
 * `/*:: something */` which translates to `something`. This makes it possible to include anything you want Flow to see, but isn't standard JavaScript, such as [field types](http://flowtype.org/docs/classes.html#_), [reusable object types](http://flowtype.org/docs/objects.html#_) and [aliases](http://flowtype.org/docs/type-aliases.html#_).
 * `/*flow-ignore-begin*/` and `/*flow-ignore-end*/`, which translate to `/*` and `*/`, respectively. Flow is usually pretty smart about type inference etc, but sometimes it's just too much work to get some part of your code to type check. You'll most often run into this when doing dynamic property access etc, which may be very idiomatic JavaScript, but where Flow won't (and sometimes can't) predict the resulting types through static analysis alone. These annotations allow you to effectively hide that code from Flow, and take the "I know what I'm doing" escape hatch. Note that many times you can still annotate the surrounding function so that it'll appear fully typed from the outside.

## Examples

TODO

## How it works

TODO
