# flotate

> A portmanteau of **flo**w and anno**tate**, allows using the [Flow](http://flowtype.org/) type checker with standard JavaScript syntax, through inline annotation comments.

[![Build Status](https://travis-ci.org/jareware/flotate.svg?branch=master)](https://travis-ci.org/jareware/flotate)

## Introduction

[Flow](http://flowtype.org/) implements many useful type checks, but also requires you to opt into a custom JavaScript syntax. This in turn makes it hard to use many other useful tools (such as linters, preprocessors, etc) which assume standards compliant JavaScript. So instead of writing:

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

It's win-some-lose-some: you lose by having to type a bit more, but win by keeping your code interoperable. Whether that's a good ROI for you will vary. That said, you don't have to bring in Flow in one go: you can add annotations to a few modules here and there, and see how it works out. With `flotate`, you can do that evaluation without big commitments (say, to a non-standard JavaScript syntax).

The CLI tool aims to be a drop-in-compatible subset of the `flow` commands, e.g. `flow check` becomes `flotate check`, but otherwise works the same. Only the `check` command is currently supported, but starting a background server should be added in an upcoming release.

## Installation

Install through `npm` as per usual:

```
$ npm install -g flotate
```

## Annotations

`flotate` defines 4 annotation types:

 * `/*: whatever */` which translates to `: whatever`. This is by far the most common annotation you'll need, as it's the syntax Flow uses for [function arguments, return values](http://flowtype.org/docs/type-annotations.html#_) and [variables](http://flowtype.org/docs/variables.html#_).
 * `/*:: something */` which translates to `something`. This makes it possible to include anything you want Flow to see, but isn't standard JavaScript, such as [field types](http://flowtype.org/docs/classes.html#_), [reusable object types](http://flowtype.org/docs/objects.html#_) and [aliases](http://flowtype.org/docs/type-aliases.html#_).
 * `/*flow-ignore-begin*/` and `/*flow-ignore-end*/`, which translate to `/*` and `*/`, respectively. Flow is usually pretty smart about type inference etc, but sometimes it's just too much work to get a specific part of your code to type check. You'll most often run into this when doing dynamic property access etc, which may be very idiomatic JavaScript, but where Flow won't (and sometimes can't) predict the resulting types through static analysis alone. These annotations allow you to effectively hide that code from Flow, and take the "I know what I'm doing" escape hatch. Note that many times you can still annotate the surrounding function so that it'll appear fully typed from the outside.

## Examples

The following demonstrates how to use each annotation type, combined with an [ES6 class](https://github.com/esnext/es6-class) definition.

```javascript
/* @flow */

/*::
  type Message = {
    timestamp: number;
    payload: string;
  };
  type Messages = Array<Message>;
*/

class MessageStore {

  /*:: _msgs: Messages; */

  constructor() {
    this._msgs = [];
  }

  addMessages(newMessages /*: Message | Messages */) {
    this._msgs = this._msgs.concat(newMessages);
  }

}

var ms = new MessageStore();

/*flow-ignore-begin*/
ms.addMessages = function() {
  console.log('addMessages() called with', arguments);
  MessageStore.prototype.addMessages.apply(ms, arguments);
};
/*flow-ignore-end*/

ms.addMessages({
  payload: "Hello world!"
});
```

Some things worth pointing out:

 * We mark the module as eligible for type-checking with `/* @flow */`.
 * We define an object type `Message` and a type alias `Messages` using the `/*::` annotation. The contents can be spread over several lines.
 * We define a field type `_msgs` using the `/*::` annotation. The contents can also be single-line, if that looks better.
 * We define a (union) argument type for `newMessages` using the `/*:` annotation, so the method accepts single objects as well as arrays of the same objects.
 * We dynamically patch `addMessages()` with some debugging info. This would cause Flow to complain about the `addMessages.apply()` call, as it loses track of argument types. We decide that "we know what we're doing", and hide that part of the code from Flow using the `/*flow-ignore-begin*/` and `/*flow-ignore-end*/` annotations.

Attempting to type-check this will give us errors:

```
$ flotate check .

/path/to/demo.js:4:17,7:2: property timestamp
Property not found in
  /path/to/demo.js:34:16,36:1: object literal

/path/to/demo.js:34:16,36:1: object literal
This type is incompatible with
  /path/to/demo.js:8:18,31: array type

/path/to/demo.js:34:16,36:1: object literal
This type is incompatible with
  /private/var/folders/k0/vy40jfp93d538th2y4hkzt7c0000gp/T/flow_jara/flowlib_b553107/lib/core.js:120:28,35: array type

Found 3 errors
```

We can fix the issue by adding the missing mandatory property `timestamp`:

```javascript
ms.addMessages({
  timestamp: Date.now(),
  payload: "Hello world!"
});
```

Now our module type-checks:

```
$ flotate check .

Found 0 errors
```

For completeness, the following is what the above code is translated to, before being handed off to Flow for analysis:

```typescript
/* @flow */


  type Message = {
    timestamp: number;
    payload: string;
  };
  type Messages = Array<Message>;


class MessageStore {

  _msgs: Messages;

  constructor() {
    this._msgs = [];
  }

  addMessages(newMessages : Message | Messages ) {
    this._msgs = this._msgs.concat(newMessages);
  }

}

var ms = new MessageStore();

/*
ms.addMessages = function() {
  console.log('addMessages() called with', arguments);
  MessageStore.prototype.addMessages.apply(ms, arguments);
};
*/

ms.addMessages({
  timestamp: Date.now(),
  payload: "Hello world!"
});
```

## How it works

This tool is fundamentally just a simple pre-processor for Flow, and mostly a combination of excellent existing tools. When type-checking code, the following happens:

 1. Check for the presence of the `.flowconfig` file. It marks Flow "workspaces".
 1. Create a temporary path, that's automatically cleaned up on exit (with [temp](https://github.com/bruce/node-temp)).
 1. Recursively copy all files in the workspace to the temporary path (with [wrench](https://github.com/ryanmcgrath/wrench-js)).
 1. Update paths in the temporary copy of the `.flowconfig` file, so they point back to the original workspace. This is only needed for paths which reach outside the workspace (e.g. `../../node_modules`), and reduces the need to copy things around.
 1. Look for all files in the temporary workspace marked with `@flow`, and transform the comment annotations to their Flow counterparts (with [esprima](https://github.com/facebook/esprima) and [falafel](https://github.com/substack/node-falafel)).
 1. Invoke the relevant `flow` check on the temporary workspace.
 1. Output results, so that all paths to the temporary workspace are transformed back to the original workspace.
 1. Clean up.
