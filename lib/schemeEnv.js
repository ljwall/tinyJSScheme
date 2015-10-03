var scheme = require('./scheme.js'),
    schemeEnv = {};

module.exports = schemeEnv;


function wrapBinNum(fn) {
  return new scheme.SchemePrimativeFunction(function (a, b) {
    if (arguments.length !== 2) {
      throw new scheme.SchemeError('Expecting two arguments');
    }
    if ((!(a instanceof scheme.SchemeNum)) || (!(b instanceof scheme.SchemeNum))) {
      throw new scheme.SchemeError('Expecting numbers');
    }
    return new scheme.SchemeNum(fn(a.val, b.val));
  });
}

schemeEnv['+'] = wrapBinNum(function(a, b) {return a+b; });
schemeEnv['*'] = wrapBinNum(function(a, b) {return a*b; });
schemeEnv['-'] = wrapBinNum(function(a, b) {return a-b; });
schemeEnv['/'] = wrapBinNum(function(a, b) {return a/b; });

