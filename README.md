# lum.not.js

A tiny proof-of-concept template engine; inspired by [doT], the `tmpl`
library from [riot.js], and John Resig's simple [micro-templating].

Doesn't have many features, and relies on external functions and libraries
for many things like escaping, encoding, [filtering] of XSS/evil-code, etc.

The only escaping it does is extremely rudimentary and offer no protection
against attacks. I'd advise to never use this engine in a place where any
untrusted end-users can interact with them!

## API Features

- Has no concept of _files_ and no built-in ability to work with
  anything other than plain string templates passed to the engine.
  This may seem like a limitation, but it is an intentional design choice!
- Can be used in a server-side runtime like Node.js, or in a client-side 
  web browser (after building a bundle with something like [Webpack]).
- The engine compiles templates into JS functions, then caches them.
- The render() method simply passes a data object to a compiled template.
  Okay, there's a bit more to it, but that's the basic concept anyway.
- Has many optional _hook_ callback functions to process the templates at
  various points in the compiling and rendering process. The hooks may be 
  specified in either the constructor, or the compile() method.
- As of `2.0` it's possible to create `Template` sub-classes and specify
  one of those when constructing the `Engine` instance.

## Template Syntax

The default syntax is pretty simple, and intentionally quite limited.
It has only two types of blocks. 

By default there are only two variables in the context of the template
blocks: `it` is the data object passed to `render()`, and `this` is the
compiled template definition object. You can define more variables in
the scope of the template context using _define blocks_.

There are no special blocks for conditional or repeatable sections.
So `if` and `else` are nowhere to be seen in these templates; instead
`test() ? trueValue : falseValue` or `it.var ?? 'default value'` are
the way to do anything involving conditional text. 

There is a helper for working with iteration, but it requires defining
the _item template_ separately from the _list template_.

### Define Context Variables

Defining context variables for common objects is handy, and easy to do:

```
{{ user = it.getUser() }}
```

Basically, a define block starts with a valid identifier followed 
by a single `=`, and then the value you are assigning as a standard
JS expression, which has access to any of the current context variables.

Since JS allows multiple variable assignments with a single `let` statement,
you can take advantage of that here, like in this example:

```
{{ me = it.currentUser, them = me.getFriends() }}
```

### Variable Interpolation

The foundation of any template engine, this is the basis from which all
else depends upon:

```
Hello {{user.name}}, you are scheduled for work {{it.day || 'today'}}.
```

## More Examples

See the tests in the `test` folder for more examples of both the
API and the available template syntax.

## A bit more the whole _no files_ thing...

So I've found a few template engines written in different languages that
are entirely unusable in many contexts as they _require_ access to the
file-system to load templates. Which might work for say PHP where it's
always server-side and thus has explicit access to the file-system,
but doesn't work in say client-side Javascript.

Well this engine intentionally doesn't have any concept of _files_ at
all, and depends on the code using it to perform any loading of the
template text from whatever sources may be applicable.

## Official URLs

This library can be found in two places:

 * [Github](https://github.com/supernovus/lum.not.js)
 * [NPM](https://www.npmjs.com/package/@lumjs/not)

## Author

Timothy Totten <2010@totten.ca>

## License

[MIT](https://spdx.org/licenses/MIT.html)

[filtering]: https://github.com/cure53/DOMPurify
[Webpack]: https://webpack.js.org/
[doT]: https://github.com/olado/doT
[riot.js]: https://riot.js.org/
[micro-templating]: https://johnresig.com/blog/javascript-micro-templating/