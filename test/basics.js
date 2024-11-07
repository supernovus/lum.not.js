"use strict";

const plan = 9; // from outer space
const t = require('@lumjs/tests').new({module, plan});
const NoT = require('../lib');
const {PS} = require('../lib/rules');
const ts = require('./inc/common');

let nt = new NoT();

let tmpl = "Hello {{it.name ?? 'World'}}, how are you?";
nt.compile({id: 'test', tmpl});

t.is(nt.render('test'), 
  'Hello World, how are you?', 
  'basic var with default value');
t.is(nt.render('test', {name: 'Lisa'}), 
  'Hello Lisa, how are you?', 
  'basic var with specified value');

tmpl = "{{name = it.name ?? 'World'}}Hello {{name}}.";
nt.compile({id: 'test2', tmpl});

t.is(nt.render('test2'), 
  'Hello World.', 
  'assignment with default value');
t.is(nt.render('test2', {name: 'darkness, my old friend'}), 
  'Hello darkness, my old friend.', 
  'assignment with specified value');

tmpl = "Goodbye {{it.friend}}";

t.is(nt.render(tmpl), 
  'Goodbye ', 
  'implicitly compiled with no values');

let tdef1 = nt.get(tmpl);

t.is(nt.render(tmpl, {friend: 'cruel world'}), 
  'Goodbye cruel world', 
  'implicitly compiled with specified value');

let tdef2 = nt.get(tmpl);

t.is(tdef1, tdef2, 'implicit templates use cached instance');

tmpl  = "{{user = it.user, name = user.name}}";
tmpl += "Meet {{name}}, a capable {{user.job}}.";
nt.compile({id: 'test3', tmpl});

let data = 
{
  user: ts.set_1.users[0],
}

t.is(nt.render('test3', data), 
  'Meet Tim, a capable geek.',
  'multiple assignments');

t.is(nt[PS.templates].size, 4, 
  'correct number of cached templates');

t.done();
