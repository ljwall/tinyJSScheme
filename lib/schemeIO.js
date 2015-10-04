var s = require('./scheme.js'),
    parseScheme = require('./parseScheme.js');

module.exports = {
  printMixin: printMixin,
  loadMixin: loadMixin
};

function printMixin (env, fn) {
  env.print = new s.SchemePrimativeFunction(function (val) {
    fn(val.toString());
    return val;
  });
}

function loadMixin (env, fn) {
  env.load = new s.SchemePrimativeFunction(function (filename) {
    if (!(filename instanceof s.SchemeString)) {
      throw new s.SchemeError('Expecting ' + s.SchemeString.typeName() + '. ' +
          'Found ' + filename.toString());
    }

    var content = fn(filename.val),
        expressions = parseScheme.many(content);

    return expressions
      .get('matched')
      .each(function (expr) {
        expr.eval(env);
      })
      .then(function () {
        return new s.SchemeBool(true);
      });
  });
}
