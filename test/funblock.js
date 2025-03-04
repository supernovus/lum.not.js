"use strict";

const plan = 2;
const t = require('@lumjs/tests').new({module, plan});
const NoT = require('../lib');
const ts = require('./inc/common');

let data = 
{
  users: ts.set_1.users,
}

const demo = ts.testset('fun_1');

// First test will be with default options.
let nt = new NoT.Engine();

t.dies(() => nt.compile(demo), 'dies when not enabled');

nt = new NoT.Engine({allowFun: true});

nt.compile(demo);

try
{
  nt.compile(demo);
  t.is(nt.render(demo.id, data), demo.want, 'fun block parsed');
}
catch(e)
{
  t.fail('compilation failed', e);
}


t.done();
