(function (modFactory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = modFactory(
      require('./lib/parseScheme.js'),
      require('./lib/scheme.js'),
      require('./lib/schemeEnv.js'),
      require('./lib/schemeIO.js')
    );
  } else if (typeof define === "function" && define.amd) {
    define([
      './lib/parseScheme',
      './lib/scheme',
      './lib/schemeEnv',
      './lib/schemeIO'
    ], modFactory);
  } else {
    throw new Error('Use a module loader!');
  }

}(function (parseScheme, scheme, schemeEnv, schemeIO) {
  return {
    parseScheme: parseScheme,
    scheme: scheme,
    schemeEnv: schemeEnv,
    schemeIO: schemeIO
  };
}));
