/**
 * Common helpers for tests.
 */
"use strict";

const fs = require('node:fs');

const DATA_FS = './test/data/'; // Relative to package dir (CWD for tests).
const DATA_JS = '../data/';     // Relative to the dir `common.js` is in.

module.exports = 
{
  dataset(name)
  {
    return require(DATA_JS+name);
  },

  testset(name, addTo)
  {
    const demo = 
    {
      id: name,
      tmpl: fs.readFileSync(DATA_FS+name+'.tmpl', 'utf8'),
      want: fs.readFileSync(DATA_FS+name+'.want', 'utf8'),
    };
  
    if (Array.isArray(addTo))
    {
      addTo.push(demo);
    }
  
    return demo;
  },

  get set_1()
  {
    return this.dataset('set_1');
  },

}
