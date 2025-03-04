"use strict";

// Default syntax rules.
const DEFAULTS =
{
  funBlock: /\{%\s*([\s\S]+?)%\}(?:\\n)?/g,
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
function escCode(code, hook, ml=false)
{ 
  //console.debug("escCode", {code, hook, def: this});
  if (hook)
  {
    code = hook.call(this, code);
  }

  const unesc = escTmpl.slice(ml ? 0 : 2);

  for (const esc of unesc)
  {
    code = code.replaceAll(esc[1], esc[0]);
  }

  // Undo the last template body rule.
  return code;
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
