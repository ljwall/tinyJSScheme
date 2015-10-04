(function (modFactory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = modFactory(require('./scheme'), require('./parseScheme'));
  } else if (typeof define === "function" && define.amd) {
    define(['./parser', './parseScheme'], modFactory);
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
  return {
    printMixin: printMixin,
    loadMixin: loadMixin
  };
}));

