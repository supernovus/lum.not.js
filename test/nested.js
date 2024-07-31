"use strict";

const plan = 3;
const t = require('@lumjs/tests').new({module, plan});
const NoT = require('../lib');

let nt = new NoT();

let tmpl = "Hello {{it.name}}, "
  + "{{ (it.age > 40) ? this.call('old', it) : this.call('young', it) }}";
nt.compile({id: 'user', tmpl});

tmpl = "at {{it.age}}, have you found 'it' yet?";
nt.compile({id: 'old', tmpl});

tmpl = "being only {{it.age}}, your adventure has just begun!";
nt.compile({id: 'young', tmpl});

let users = [{name: 'Bob', age: 42}, {name: 'Erika', age: 27}];

let want = 
[
  "Hello Bob, at 42, have you found 'it' yet?",
  "Hello Erika, being only 27, your adventure has just begun!",
];

t.is(nt.render('user', users[0]), 
  want[0], 
  'use of this.call() in template');

tmpl = '- {{it}}\\n';
nt.compile({id: 'item', tmpl});

tmpl = "Fruits:\\n{{this.for('item', it)}}";
nt.compile({id: 'fruitList', tmpl});

let fruit = ['apple','blueberry','tomato'];

t.is(nt.render('fruitList', fruit),
  "Fruits:\n- apple\n- blueberry\n- tomato\n",
  'use of this.for() with simple template');

tmpl = '{{this.for("user", it.users, "\\n")}}';
nt.compile({id: 'userList', tmpl});

t.is(nt.render('userList', {users}),
  want.join("\n"),
  'this.for() with nested this.call() blocks');

t.done();
