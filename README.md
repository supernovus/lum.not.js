# lum.not.js

A tiny proof-of-concept template engine; inspired by `doT`, `riot.tmpl`, 
and John Resig's simple micro-templating.

Doesn't have many features, and relies on external functions and libraries
for many things like escaping, encoding, [filtering] of XSS/evil-code, etc.

Due to the extreme limitations of this implementation, you should probably
use a more well-developed template engine. This is a "for fun" kind of thing,
and really shouldn't be used in anything serious.

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

## Official URLs

This library can be found in two places:

 * [Github](https://github.com/supernovus/lum.not.js)
 * [NPM](https://www.npmjs.com/package/@lumjs/not)

## Author

Timothy Totten <2010@totten.ca>

## License

[MIT](https://spdx.org/licenses/MIT.html)

[filtering]: https://github.com/cure53/DOMPurify
