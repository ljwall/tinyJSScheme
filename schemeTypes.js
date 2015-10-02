var globalEnv = {};

module.exports = {
  SchemeAtom: SchemeAtom,
  SchemeString: SchemeString,
  SchemeBool: SchemeBool,
  SchemeNum: SchemeNum,
  SchemeList: SchemeList,
  globalEnv: globalEnv,
  SchemeError: SchemeError,
  SchemePrimativeFunction: SchemePrimativeFunction
};

function SchemeError (msg) {
  this.message = msg;
}
SchemeError.prototype = new Error();

function SchemeAtom (val) { this.val = val; }
function SchemeString (val) { this.val = val; }
function SchemeBool (val) { this.val = val; }
function SchemeNum (val) { this.val = val; }
function SchemeList (val) { this.val = val; }

function SchemeFunction () {}

function SchemePrimativeFunction (fn) { this.fn = fn; }
SchemePrimativeFunction.prototype = new SchemeFunction();



SchemePrimativeFunction.prototype.apply = function (argsList) {
  return this.fn.apply(null, argsList);
}

/*
 * Evaling thigs....
 */

SchemeAtom.prototype.eval = function (env) {
  if (env[this.val] === undefined) {
    throw new SchemeError('Variable ' + this.val + 'undefined.');
  }
  return env[this.val];
};

SchemeString.prototype.eval = function (env) { return this; };
SchemeBool.prototype.eval = function (env) { return this; };
SchemeNum.prototype.eval = function (env) { return this; };

SchemeList.prototype.eval = function (env) {
  // check for assorted special forms
  if (this.val[0] instanceof SchemeAtom) {
    switch (this.val[0].val) {
      case 'define':
        if ((this.val.length !== 3) || !(this.val[1] instanceof SchemeAtom)) {
          throw new SchemeError('Form of define is (define <name> <expr>)');
        }
        if (env.hasOwnProperty(this.val[1].val)) {
          throw new SchemeError('Already defined:' + this.val[1].val);
        }
        env[this.val[1].val] = this.val[2].eval(env);
        return env[this.val[1].val];
    }
  }

  // Not a special form - must be a function...
  evaledElems = this.val.map(function (li) {return li.eval(env);});
  if (!(evaledElems[0] instanceof SchemeFunction)) {
    throw new SchemeError('Not a function');
  }
  return evaledElems[0].apply(evaledElems.slice(1));
};


/*
 * Primative functions...
 */

function wrapBinNum(fn) {
  return new SchemePrimativeFunction(function (a, b) {
    if (arguments.length !== 2) {
      throw new SchemeError('Expecting two arguments');
    }
    if ((!(a instanceof SchemeNum)) || (!(b instanceof SchemeNum))) {
      throw new SchemeError('Expecting numbers');
    }
    return new SchemeNum(fn(a.val, b.val));
  });
}

globalEnv['+'] = wrapBinNum(function(a, b) {return a+b; });
globalEnv['*'] = wrapBinNum(function(a, b) {return a*b; });
globalEnv['-'] = wrapBinNum(function(a, b) {return a-b; });
globalEnv['/'] = wrapBinNum(function(a, b) {return a/b; });
