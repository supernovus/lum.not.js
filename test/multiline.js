"use strict";

const plan = 1;
const t = require('@lumjs/tests').new({module, plan});
const NoT = require('../lib');
const ts = require('./inc/common');
const demos = [];

let nt = new NoT.Engine();
let data = 
{
  users: ts.set_1.users.slice(3,5),
};

ts.testset('ml_1', demos);

// TODO: test some more advanced features.

for (const demo of demos)
{
  nt.compile(demo);
  t.is(nt.render(demo.id, data), demo.want, demo);
}

t.done();
