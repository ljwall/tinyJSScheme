#!/usr/bin/env node

var parseScheme = require('../index.js').parseScheme,
    scheme = require('../index.js').scheme,
    schemeEnv = require('../index.js').schemeEnv,
    readline = require('readline'),
    rl = readline.createInterface(process.stdin, process.stdout);

var parseExpr = function (str) {
  return parseScheme(str)
  .then(function (res) {
    return res.matched[0];
  });
};

var env = Object.create(schemeEnv);

rl.setPrompt('>>> ');
rl.prompt();

rl.on('line', function(line) {
  parseExpr(line)
  .then(function (expr) {
    console.log(expr.eval(env).toString());
  })
  .catch(scheme.SchemeError, function (err) {
     console.log('Error:', err.toString());
  })
  .then(rl.prompt.bind(rl));
})
.on('close', function() {
  console.log('\nBye bye...\n');
  process.exit(0);
});
