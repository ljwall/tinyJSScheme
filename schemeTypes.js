var globalEnv = {};

module.exports = {
  SchemeAtom: SchemeAtom,
  SchemeString: SchemeString,
  SchemeBool: SchemeBool,
  SchemeNum: SchemeNum,
  SchemeList: SchemeList,
  globalEnv: globalEnv
};

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

SchemeAtom.prototype.eval = function (env) {
  if (env[this.val] === undefined) {
    throw new Error('Variable', this.val, 'undefined.');
  }
  return env[this.val];
};

SchemeString.prototype.eval = function (env) { return this; };
SchemeBool.prototype.eval = function (env) { return this; };
SchemeNum.prototype.eval = function (env) { return this; };

SchemeList.prototype.eval = function (env) {
  evaledElems = this.val.map(function (li) {return li.eval(env);});
  if (! evaledElems[0] instanceof SchemeFunction) {
    throw new Error('Not a function');
  }
  return evaledElems[0].apply(evaledElems.slice(1));
};

function wrapBinNum(fn) {
  return new SchemePrimativeFunction(function (a, b) {
    if (arguments.length !== 2) {
      throw new Error('Expecting two arguments');
    }
    if ((! a instanceof SchemeNum) || (! b instanceof SchemeNum)) {
      throw new Error('Expecting numbers');
    }
    return new SchemeNum(fn(a.val, b.val));
  });
}

globalEnv['+'] = wrapBinNum(function(a, b) {return a+b; });
globalEnv['*'] = wrapBinNum(function(a, b) {return a*b; });
globalEnv['-'] = wrapBinNum(function(a, b) {return a-b; });
globalEnv['/'] = wrapBinNum(function(a, b) {return a/b; });
