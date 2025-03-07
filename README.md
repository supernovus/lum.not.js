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
- As of `2.1` you can enable an optional feature that allows for more complex
  JS snippets to be used in templates. It's obviously an even bigger potential 
  source of problems, so it's disabled by default.

## Template Syntax

The default syntax is pretty simple, and intentionally quite limited.
By default there are only two types of blocks (_var_ and _def_), with an 
optional third type (_fun_) able to be enabled via options.

By default there are only two variables in the context of the template
blocks: `it` is the data object passed to `render()`, and `this` is the
compiled template definition object. You can define more variables in
the scope of the template context using _define blocks_ (which internally
build `let` statements in the compiled template function).

Template conditionals and repeatable fragments are handled differently
than in most template engines. Without enabling _fun blocks_, `if` and `else`, 
statements aren't able to be used. Simple conditionals may be done using
`test() ? trueValue : falseValue` or `it.var ?? 'default value'` statements.
Anything more advanced will likely require the use of _fun blocks_.

There is a built-in method for working with iteration. It requires defining
the _item template_ separately from the _list template_. If you need more
traditional `for` or `while` statements, you'll need to enable _fun blocks_, 
and then pray your blocks don't have any syntax errors in them.

### Define Context Variables

Defining context variables for common objects is handy, and easy to do via
_def_ blocks, which all have the same syntax:

```
{{ user = it.getUser() }}
```

Basically, a define block starts with a valid _identifier_ followed 
by a single `=`, and then the value you are assigning as a standard
JS expression, which has access to any of the current context variables.

Since JS allows multiple variable assignments with a single `let` statement,
you can take advantage of that here, like in this example:

```
{{ me = it.currentUser, them = me.getFriends() }}
```

or even using modern JS variable expansion:

```
{{ {me,myself,i} = it.selfNames, [us,them] = it.teams }}
```

Basically if it'd be allowed as part of a regular JS `let` statement,
it _should_ be able to work here (YMMV).

### Variable Interpolation

The foundation of any template engine, _var blocks_ are the basis from which 
all else depends upon:

```
Hello {{user.name}}, you are scheduled for work {{it.day || 'today'}}.
```

### Raw Code Blocks

If enabled via the `allowFun` option, _fun blocks_ are a way to use raw
JS statements as a part of your templates. It's dangerous, and really easy
to break things, so only enable these block if you know what you're doing.

```
{%
if (it.list) {
  for (let what of it.list) {
%}
<li>A wild {{what.name}} has appeared!</li>
{%
  } // for
}   // if
%}
```

Attempting to use the `{% %}` syntax without setting `{allowFun: true}` in
the options will result in a `SyntaxError` being thrown when the engine
tries to compile the template.

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