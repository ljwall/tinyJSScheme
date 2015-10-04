#!/usr/bin/env node

var parseScheme = require('../index.js').parseScheme,
    scheme = require('../index.js').scheme,
    schemeEnv = require('../index.js').schemeEnv,
    schemeIO = require('../index.js').schemeIO,
    readline = require('readline'),
    rl = readline.createInterface(process.stdin, process.stdout),
    fs = require('fs');

var parseExpr = function (str) {
  return parseScheme.one(str)
  .then(function (res) {
    return res.matched[0];
  });
};

var env = Object.create(schemeEnv);
schemeIO.printMixin(env, console.log);
schemeIO.loadMixin(env, function (filename) {
  var content;
  try {
    content = fs.readFileSync(filename, 'utf8');
  } catch (err) {
    throw new scheme.SchemeError(err.message);
  }
  return content;
});

rl.setPrompt('>>> ');
rl.prompt();

rl.on('line', function(line) {
  parseExpr(line)
  .then(function (expr) {
    return expr.eval(env); /* eval may return a result or a promise */
  })
  .call('toString')
  .tap(console.log)
  .catch(scheme.SchemeError, function (err) {
     console.log('Error:', err.toString());
  })
  .catch(parseScheme.ParseError, function (err) {
     console.log('Parser error. Expecting:\n', err.expecting);
  })
  .then(rl.prompt.bind(rl));
})
.on('close', function() {
  console.log('\nBye bye...\n');
  process.exit(0);
});
