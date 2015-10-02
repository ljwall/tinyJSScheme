var parseScheme = require('./parseScheme.js'),
    scheme = require('./schemeTypes'),
    readline = require('readline'),
    rl = readline.createInterface(process.stdin, process.stdout);

var parseExpr = function (str) {
  return parseScheme(str)
  .then(function (res) {
    return res.matched[0];
  });
};

rl.setPrompt('>>> ');
rl.prompt();

rl.on('line', function(line) {
  parseExpr(line)
  .then(function (expr) {
    console.log(expr.eval(scheme.globalEnv));
  })
  .catch(function (err) {
     console.log('Error:', err);
  })
  .then(rl.prompt.bind(rl))
}).on('close', function() {
  console.log('Bye bye...');
  process.exit(0);
});
