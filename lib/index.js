"use strict";

const core = require('@lumjs/core');
const {def,S,F,isObj,needObj} = core.types;

const Defaults =
{
  defBlock: /\{\{\s*(\w+)\s*=([^=][\s\S]+?)\}\}/g,
  varBlock: /\{\{([\s\S]+?)\}\}/g,
  dataVar: 'it',
}

// Will be assigned as `for` to each template definition object.
function renderFor(tmpl, listData, sep='')
{
  const output = [];
  for (const key in listData)
  {
    const dataItem = listData[key];
    output.push(this.templates.render(tmpl, dataItem));
  }
  return output.join(sep);
}

/**
 * A bare-bones template engine.
 * @exports module:@lumjs/not
 */
class NoT
{
  /**
   * Build a NoT template registry instance.
   * 
   * @param {object} [options] Options
   * 
   * TODO: document more options.
   * 
   * @param {function} [options.preProcess] Pre-process template text.
   * 
   * Used by the `compile()` method; the template definition object
   * will be assigned as `this`, and the function will be passed
   * the template text before it is compiled.
   * 
   * It MUST return the template text with any pre-processing completed.
   * 
   * @param {function} [options.postProcess] Post-process rendered text.
   * 
   * Used by the `render()` method; the template definition object
   * will be assigned as `this`, and the function will be passed the
   * fully-rendered text for any processing after it's done.
   * 
   * It MUST return the rendered text with any post-processing completed.
   * 
   */
  constructor(options={})
  {
    const syntax = Object.assign({}, Defaults, options.syntax);

    def(this, 'options',  {value: options});
    def(this, '$syntax',  {value: syntax});
    def(this, '$tmpl',    {}); // Compiled template definitions.
  }

  /**
   * Compile a template and cache it for use later.
   * 
   * @param {(object|string)} options - Options to build the template.
   * 
   * If this is a `string` it will be used as the `tmpl` and `id` options.
   * 
   * @param {string} options.tmpl - The template text we are compiling.
   * @param {string} [options.text] An alias of `options.tmpl`.
   * @param {string} [options.id] A unique identifier for this template.
   * 
   * Generally used to give a nice short name to a template.
   * If not specified, the `options.tmpl` will be used, which is usually
   * not a nice short name, but is supported for unnamed/implicit templates.
   * 
   * @param {function} [options.preProcess] Pre-process template text.
   * 
   * Override the version specified in the instance options.
   * See the constructor description for details.
   * 
   * @param {function} [options.postProcess] Post-process rendered text.
   * 
   * Override the version specified in the instance options.
   * See the constructor description for details.
   * 
   * @returns {object} A template definition object.
   * 
   * Will contain a few properties that may be useful:
   * 
   * - `options` exactly as passed to this method. 
   * - `templates` which is the NoT instance itself. 
   * - `render` is method that renders the template;
   *   the data object is the sole argument for this method.
   * - `for` is a method that takes the name of a template,
   *   and an Array (or anything that supports `for (key in obj)`),
   *   and will render the template once for each item in the list,
   *   then join the output using a character of your choice.
   * 
   */
  compile(options)
  {
    if (typeof options === S)
    {
      options = {tmpl: options}
    }
    else if (!isObj(options))
    {
      console.error({options, notInstance: this});
      throw new TypeError("compile() accepts a string or an object");
    }

    let tmpl = options.tmpl ?? options.text;
    if (typeof tmpl !== S)
    {
      console.error({options, notInstance: this});
      throw new TypeError("options.tmpl must be a string");
    }

    const before = options.preProcess  ?? this.options.preProcess;
    const after  = options.postProcess ?? this.options.postProcess;

    const id = options.id ?? tmpl;
    const def = 
    {
      options, 
      templates: this, 
      for: renderFor,
      call(tmpl, data)
      {
        return this.templates.render(tmpl, data);
      }
    };

    const dv = this.$syntax.dataVar;

    let clone = options.clone ?? this.options.clone ?? false;
    if (clone && typeof clone !== F)
    { // Use a default cloning function.
      clone = (data) => Object.assign({}, data);
    }

    if (typeof before === F)
    {
      tmpl = before.call(def, tmpl);
    }

    let tmplBody = "let __t__ = []; __t__.push(\"";

    tmplBody += tmpl
    .replaceAll(this.$syntax.defBlock, 
      function(match, varname, assignment)
      {
        return `"); let ${varname} = ${assignment}; __t__.push("`;
      })
    .replaceAll(this.$syntax.varBlock, 
      function(match, stmt)
      {
        return `"); __t__.push(${stmt}); __t__.push("`;
      })
    ; // Done expanding the template.

    tmplBody += "\"); return(__t__.join(''));";

    def.$compiledRenderer = new Function(dv, tmplBody);

    def.render = function(data)
    {
      if (clone)
      { // A shallow clone of the data.
        data = clone(data);
      }

      const rendered = def.$compiledRenderer(data);

      if (typeof after === F)
      {
        rendered = after.call(def, rendered);
      }
  
      return rendered;
    }

    return (this.$tmpl[id] = def);
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
      console.error({options, notInstance: this});
      const errmsg = fromRender 
        ? 'render() first argument must be a string or object'
        : 'get() accepts a string or an object';
      throw new TypeError(errmsg);
    }

    if (this.$tmpl[id])
    { // A compiled template was found.
      return this.$tmpl[id];
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

module.exports = NoT;
