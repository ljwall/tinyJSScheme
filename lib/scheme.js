var globalEnv = {};

module.exports = {
  SchemeAtom: SchemeAtom,
  SchemeString: SchemeString,
  SchemeBool: SchemeBool,
  SchemeNum: SchemeNum,
  SchemeList: SchemeList,
  SchemeDottedList: SchemeDottedList,
  globalEnv: globalEnv,
  SchemeError: SchemeError,
  SchemePrimativeFunction: SchemePrimativeFunction,
  SchemeUserFunction: SchemeUserFunction
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
function SchemeDottedList (list, last) {
  this.list = list;
  this.last = last;
}

function SchemeFunction () {}

function SchemePrimativeFunction (fn) { this.fn = fn; }
SchemePrimativeFunction.prototype = new SchemeFunction();

SchemePrimativeFunction.prototype.apply = function (argsList) {
  return this.fn.apply(null, argsList);
};

function SchemeUserFunction (env, argNames, bodyExpressions) {
  this.env = env;
  this.argNames = argNames;
  this.bodyExpressions = bodyExpressions;
}
SchemeUserFunction.prototype = new SchemeFunction();

SchemeUserFunction.prototype.apply = function (argsList) {
  if (this.argNames.length !== argsList.length) {
    throw new SchemeError("Exected " + this.argNames.length + " arguments; found:", argsList);
  }
  var newScope = Object.create(this.env);
  for (var i=0; i < this.argNames.length; i++) {
    newScope[this.argNames[i].val] = argsList[i];
  }
  return this.bodyExpressions.reduce(function (_, expr) {
    //debugger
    return expr.eval(newScope);
  }, new SchemeList([]));
};

/*
 * Evaling thigs....
 */

SchemeAtom.prototype.eval = function (env) {
  if (env[this.val] === undefined) {
    throw new SchemeError('Variable ' + this.val + ' undefined.');
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
      case 'lambda':
        if ((this.val.length < 3) || !(this.val[1] instanceof SchemeList)) {
          throw new SchemeError('Form of lambda is (lambda (arg1 .. argN) expr1 .. exprN)');
        }
        this.val[1].val.forEach(function (argName) {
          if (!(argName instanceof SchemeAtom)) {
            throw new SchemeError('Form of lambda is (lambda (arg1 .. argN) expr1 .. exprN)\n' +
                                      'where each of arg1 .. argN is a binding name.');
          }
        });
        return new SchemeUserFunction(env, this.val[1].val, this.val.slice(2));
      case 'quoted':
        if (this.val.length !== 2) {
          throw new SchemeError('Form of quoted is (quoted expr)');
        }
        return this.val[1];
    }
  }

  // Not a special form - must be a function...
  var evaledElems = this.val.map(function (li) {return li.eval(env);});
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

/*
 * toString functions..
 */


SchemeAtom.prototype.toString = function () {
  return this.val;
};
SchemeString.prototype.toString = function () {
  return '"' + this.val + '"';
};
SchemeBool.prototype.toString = function () {
  if (this.val) {
    return "#t";
  }
  return "#f";
};
SchemeNum.prototype.toString = function () {
  return this.val.toString();
};
SchemeList.prototype.toString = function () {
  return '(' +
    this.val.map(function (item) {return item.toString(); })
    .reduce(function(acc, next) {
      return acc + ' ' + next;
    }, '').trim() + ')';
};

SchemeDottedList.prototype.toString = function () {
  return '(' +
    this.list.map(function (item) {return item.toString(); })
    .reduce(function(acc, next) {
      return acc + next + ' ';
    }, '') + '. ' + this.last.toString() + ')';
};

SchemeError.prototype.toString = function () {
  return this.message;
};
SchemePrimativeFunction.prototype.toString = function () {
  return '<built-in function>';
};
SchemeUserFunction.prototype.toString = function () {
  return '(lambda ' + (new SchemeList(this.argNames)).toString() + ' ...)';
};
