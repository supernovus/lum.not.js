/**
 * A bare-bones template engine
 * @module @lumjs/not
 */
"use strict";

const {PS} = require('./rules');

module.exports =
{
  Engine: require('./engine'),
  Template: require('./template'),
  [PS.self]: PS,
}
