"use strict";

// Default syntax rules.
const DEFAULTS =
{
  defBlock: /\{\{\s*([\w{[][\w\s,{}[\]]+?)\s*=([^=][\s\S]+?)\}\}(?:\\n)*/g,
  varBlock: /\{\{([\s\S]+?)\}\}/g,
  dataVar: 'it',
}

// Escape rules for the template body.
const escTmpl =
[
  ["\n",  "\\n"],
  ["\r",  "\\r"],
  ['"',   '\\"'],
];

// Escape rules for code blocks.
function escCode(code, hook)
{ 
  //console.debug("escCode", {code, hook, def: this});
  if (hook)
  {
    code = hook.call(this, code);
  }

  // Undo the last template body rule.
  return code.replaceAll('\\"', '"');
}

// Prefix for PS.* symbol descriptions
const NS = '@lumjs/not';
const NSE = NS+'.Engine~';
const NST = NS+'.Template~';

// Private property storage symbols
const PS =
{
  self:      Symbol.for(NS+'~PS'),
  syntax:    Symbol(NSE+'syntax'),
  templates: Symbol(NSE+'templates'),
  tmplClass: Symbol(NSE+'tmplClass'),
  renderer:  Symbol(NST+'renderer'),
  after:     Symbol(NST+'postRender'),

  _: {NS, NSE, NST},
}

module.exports =
{
  DEFAULTS, escTmpl, escCode, PS,
}
