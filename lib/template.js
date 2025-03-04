"use strict";

const core = require('@lumjs/core');
const {F,isIterable} = core.types;
const {PS} = require('./rules');

/**
 * A template definition object
 * 
 * You should never have to construct this manually.
 * New instances are created by the engine's compile() method.
 * 
 * You _MAY_ however make sub-classes of this and specify one
 * as the `templateClass` option for your engine instance if you
 * have specific requirements.
 * 
 * @alias module:@lumjs/not.Template
 * @see module:@lumjs/not.Engine#compile
 */
class NoTemplate 
{
  /**
   * @param {module:@lumjs/not.Engine} engine 
   * @param {object} options 
   * @param {*} id 
   */
  constructor(engine, options)
  {
    this.templates = this.engine = engine;
    this.options = options;
    
    this[PS.after] = engine._hook(options, 'postProcess');

    if (this.clone === undefined)
    {
      let clone = options.clone ?? engine.options.clone ?? false;
      if (clone && typeof clone !== F)
      { // Use a default cloning function.
        clone = (data) => Object.assign({}, data);
      }
      this.clone = clone;
    }
  }

  /**
   * Render a template multiple times for items in a list
   * @param {(string|object)} tmpl - Template for each item
   * @param {Iterable<object>} listData - Item data objects
   * @param {string} [sep=''] Join rendered items with this 
   * @returns {string} Rendered output for all items
   */
  for(tmpl, listData, sep='')
  {
    const output = [];
    if (isIterable(listData))
    {
      for (const dataItem of listData)
      {
        output.push(this.engine.render(tmpl, dataItem));
      }
    }
    else
    {
      console.error('not iterable', {listData, tmpl, sep});
    }
    return output.join(sep);
  }

  /**
   * Render another template and return the output
   * @param {(string|object)} tmpl
   * @param {object} data 
   * @returns {string}
   */
  call(tmpl, data)
  {
    return this.engine.render(tmpl, data);
  }

  /**
   * Render this template with the given data
   * 
   * This is what {@link module:@lumjs/not.Engine#render} calls
   * to actually perform the render operation.
   * 
   * @param {object} data 
   * @returns {string}
   */
  render(data)
  {
    if (typeof this.clone === F)
    {
      data = this.clone(data);
    }

    let rendered = this[PS.renderer](data);

    if (typeof this[PS.after] === F)
    {
      rendered = this[PS.after](rendered);
    }

    return rendered;
  }

}

module.exports = NoTemplate;
