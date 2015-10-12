(function (modFactory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = modFactory(require('./scheme'), require('./parseScheme'));
  } else if (typeof define === "function" && define.amd) {
    define(['./scheme', './parseScheme'], modFactory);
  } else {
    throw new Error('Use a module loader!');
  }

}(function (s, parseScheme) {
  function printMixin (env, fn) {
    env.print = new s.SchemePrimativeFunction(function (val) {
      fn(val.toString());
      return val;
    });
  }

  function loadMixin (env, fn) {
    env.load = new s.SchemePrimativeFunction(function (filename) {
      var content, expressions;

      if (fn.length > 0) {
        if (!(filename instanceof s.SchemeString)) {
          throw new s.SchemeError('Expecting ' + s.SchemeString.typeName() + '. ' +
              'Found ' + (filename ? filename.toString() : 'Nothing'));
        }
        content = fn(filename.val);
      } else {
        content = fn();
      }

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
  return {
    printMixin: printMixin,
    loadMixin: loadMixin
  };
}));

