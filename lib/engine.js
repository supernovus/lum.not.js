"use strict";

const core = require('@lumjs/core');
const {def,S,F,isObj} = core.types;
const copy = Object.assign;

const Template = require('./template');
const {DEFAULTS, escTmpl, escCode, PS} = require('./rules');

// Common template JS snippets
const T =
{
  s: '__t__.push("',
  e: '"); ',
}

// Reserved constructor options to remove
const R_OPTS = ['syntax','tmplClass'];

/**
 * The template engine class
 * 
 * Compiles and caches templates, and handles the overall rendering process.
 * This is generally the only class you'll need for most cases.
 * 
 * @alias module:@lumjs/not.Engine
 */
class NoTengine
{
  /**
   * Build a template engine instance
   * 
   * @param {object} [options] Options
   * 
   * A shallow copy of the options with a few _constructor-only_ options
   * removed will be assigned as `this.options`
   * 
   * All `<hook>` options will have the template definition object
   * assigned as `this`, and will be passed a single string argument.
   * They may process the string in any way they see fit, then MUST
   * return the processed string.
   *
   * @param {boolean} [options.allowFun=false] Allow _fun_ blocks?
   *
   * Fun blocks allow for blocks of arbitrary JS in the template itself.
   * If enabled the default syntax uses `{% %}` markers for these blocks,
   * and may consist of multiple lines unlike the other kinds of blocks.
   * Obviously only enable this if you really know what you're doing!
   * 
   * @param {function} [options.preProcess] Pre-process template text <hook>
   * 
   * Will be passed the raw template text before any rendering.
   * 
   * @param {function} [options.postProcess] Post-process rendered text <hook>
   * 
   * Will be passed the fully rendered output text.
   * 
   * @param {function} [options.replCode] Process code blocks <hook>
   * 
   * Will be passed the contents of any supported syntax blocks, regardless
   * of the type of block.
   * 
   * Will be called once for each interpolation block in the template.
   * 
   * Will be called twice for each definition/assignment block,
   * see `.replDef` option for details.
   *
   * Will be called once for each _fun_ block (if enabled).
   * 
   * May be overridden by more specific hooks.
   * 
   * @param {function} [options.replVar] Process interpolation blocks <hook>
   * 
   * Overrides `.replCode` for `{{ it.var }}` type blocks.
   * 
   * @param {function} [options.replDef] Process definition blocks <hook>
   * 
   * Overrides `.replCode` for `{{ lhs = rhs }}` type blocks.
   * It will be called twice for each block, first for the `lhs` text,
   * and then for the `rhs` text. May be overridden by more specific hooks.
   * 
   * @param {function} [options.replLHS] Process LHS definition <hook>
   * 
   * Overrides `.replDef` for the `lhs` text specifically.
   * Will be called once for each assignment block.
   * 
   * @param {function} [options.replRHS] Process RHS definition <hook>
   * 
   * Overrides `.replDef` for the `rhs` text specifically.
   * Will be called once for each assignment block.
   *
   * @param {function} [options.replFun] Process _fun_ blocks <hook>
   *
   * Overrides `.replCode` for `{% %}` type blocks.
   * 
   * @param {function} [options.tmplClass] Template class <constructor-only>
   * 
   * Will be used for the template context objects (`this` in templates).
   * This **MUST** be a sub-class of {@link module:@lumjs/not.Template}!
   * 
   * @param {object} [options.syntax] Override the syntax <constructor-only>
   *
   * @param {string} [options.syntax.dataVar="it"] Name of the data variable
   * that will be available in template blocks. I picked `it` as it was short,
   * easy to remember, and used by a few other engines/languages.
   * 
   * @param {RegExp} [options.syntax.defBlock] Pattern for define blocks;
   * read the library code fully before even attempting to change this!
   *
   * @param {RegExp} [options.syntax.varBlock] Pattern for interpolation;
   * again read the library fully before messing with this!
   *
   * @param {RegExp} [options.syntax.funBlock] Pattern for _fun_ blocks;
   * for the last time, read the damn library fully!
   * 
   */
  constructor(options)
  {
    // We're using a shallow copy of the options
    options = copy({}, options);

    const syntax = copy({}, DEFAULTS, options.syntax);

    let tmplClass = Template;
    if (typeof options.tmplClass === F)
    {
      if (Template.isPrototypeOf(options.tmplClass))
      {
        tmplClass = options.tmplClass;
      }
      else
      {
        console.error(options);
        throw new TypeError("options.template must be a Template subclass");
      }
    }

    // Now make the copy of options that will be `this.options`
    for (let ro of R_OPTS)
    {
      delete options[ro];
    }

    def(this, 'options',    {value: options});
    def(this, PS.syntax,    {value: syntax});
    def(this, PS.templates, {value: new Map()});
    def(this, PS.tmplClass, {value: tmplClass});
  }

  /**
   * Get a hook callback function from either options
   * passed to an instance method, or `this.options`
   * @protected
   * @param {object} options - Options passed directly;
   * these always take priority over `this.options`
   * @param  {...string} names - Option names to look for;
   * the first option that has a function value will be used
   * @returns {?function} A callback if one was found
   */
  _hook(options, ...names)
  {
    let hook;
    for (const name of names)
    {
      hook = options[name] ?? this.options[name];
      if (typeof hook === F)
      {
        return hook;
      }
    }
    return null;
  }

  /**
   * Compile a template and cache it for use later.
   * 
   * @param {(object|string)} options - Options to build the template.
   * 
   * If this is a `string` it will be used as the `tmpl` and `id` options.
   * 
   * Any of the _hook options_ from the constructor may be overridden here.
   * 
   * @param {string} options.tmpl - The template text we are compiling.
   * @param {string} [options.text] An alias of `options.tmpl`.
   * @param {*} [options.id] A unique identifier for this template.
   * 
   * Used to give a unique identifier to a template so that it can
   * be cached and referred to elsewhere.
   * 
   * Any value other than `null` or `undefined` may be used, but
   * generally a `string` or `number` would be the most common ids.
   * 
   * If not specified, the `options.tmpl` will be used, which is usually
   * not a nice short name, but is supported for unnamed/implicit templates.
   * 
   * @returns {module:@lumjs/not~Template}
   */
  compile(options)
  {
    if (typeof options === S)
    {
      options = {tmpl: options}
    }
    else if (!isObj(options))
    {
      console.error({options, engine: this});
      throw new TypeError("compile() accepts a string or an object");
    }

    let tmpl = options.tmpl ?? options.text;
    if (typeof tmpl !== S)
    {
      console.error({options, engine: this});
      throw new TypeError("options.tmpl must be a string");
    }

    const syn = this[PS.syntax];

    const before = this._hook(options, 'preProcess'); 
    const plhs = this._hook(options, 'replLHS', 'replDef', 'replCode');
    const prhs = this._hook(options, 'replRHS', 'replDef', 'replCode');
    const pvar = this._hook(options, 'replVar', 'replCode');
    const pfun = this._hook(options, 'replFun', 'replCode');

    const id = options.id ?? tmpl;
    const dv = syn.dataVar;

    const def = new this[PS.tmplClass](this, options);
    const esc = escCode.bind(def);

    const funok = options.allowFun ?? this.options.allowFun ?? false;

    if (typeof before === F)
    { // A pre-processor function.
      tmpl = before.call(def, tmpl);
    }

    for (const esc of escTmpl)
    { // Escape certain special characters.
      tmpl = tmpl.replaceAll(esc[0], esc[1]);
    }

    let tmplBody = "let __t__ = []; "+T.s;

    tmplBody += tmpl
    .replaceAll(syn.defBlock,
      function(match, lhs, rhs)
      {
        return T.e+`let ${esc(lhs,plhs)} = ${esc(rhs,prhs)}; `+T.s;
      })
    .replaceAll(syn.varBlock, 
      function(match, stmt)
      {
        return T.e+`__t__.push(${esc(stmt,pvar)}); `+T.s;
      })
    .replaceAll(syn.funBlock,
      function(match, stmt)
      {
        if (funok)
        { // Raw statements
          return T.e+esc(stmt,pfun,true)+T.s;
        }
        else
        { // No fun
          throw new SyntaxError('Fun blocks not enabled');
        }
      })
    ; // Done expanding the template.
  
    tmplBody += "\"); return(__t__.join(''));";

    def[PS.renderer] = new Function(dv, tmplBody);
    this[PS.templates].set(id, def);

    return def;
  } // compile()

  /**
   * Get a template definition.
   * 
   * @param {string} id - The template id you want to get.
   * 
   * By default this must have been created using `compile()` already.
   * 
   * @param {boolean} [fromRender=false] Method was called from `render()`;
   * 
   * If `true`, this method signature changes, and `id` becomes the
   * `options` argument from the `compile()` method.
   * 
   * Instead of returning `null` when no existing template is found, 
   * it will pass the options to `compile()` and return the newly 
   * compiled definition object.
   * 
   * This parameter is meant for internal use by `render()`, but I'm
   * documenting it anyway in case there are other potential uses for it.
   * 
   * @returns {?object} A template def if one was found,
   * or null otherwise.
   */
  get(options, fromRender=false)
  {
    let id;

    if (typeof options === S)
    { // The id was passed.
      id = options;
    }
    else if (isObj(options))
    { // Options were passed.
      id = options.id ?? options.tmpl ?? options.text ?? '';
    }
    else
    { // Nothing valid was passed.
      console.error({options, engine: this});
      const errmsg = fromRender 
        ? 'render() first argument must be a string or object'
        : 'get() accepts a string or an object';
      throw new TypeError(errmsg);
    }

    const tmpl = this[PS.templates];
    if (tmpl.has(id))
    { // A compiled template was found.
      return tmpl.get(id);
    }
    else if (fromRender)
    { // We're going to try compiling the template on the fly.
      return this.compile(options);
    }
    else
    { // Nothing found.
      return null;
    }
  }

  /**
   * Render a template.
   * 
   * @param {(string|object)} options - The same options as `compile()`;
   * 
   * If this is a string, it may be the `id` of an existing template,
   * or the text for an implicitly-compiled template.
   * 
   * @param {object} [data] Data for the render process.
   * @returns {string} The fully-rendered output.
   */
  render(options, data)
  {
    const tdef = this.get(options, true);
    return tdef.render(data ?? options.data ?? {});
  }

}

module.exports = NoTengine;
