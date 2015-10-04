module.exports = {
  SchemeAtom: SchemeAtom,
  SchemeString: SchemeString,
  SchemeBool: SchemeBool,
  SchemeNum: SchemeNum,
  SchemeList: SchemeList,
  SchemeDottedList: SchemeDottedList,
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

SchemeDottedList.prototype.eval = function (env) {
  throw new SchemeError('Can\'t evaluate dotted list ' + this.toString());
};

SchemeList.prototype.eval = function (env) {
  // check for assorted special forms
  if (this.val[0] instanceof SchemeAtom) {
    switch (this.val[0].val) {
      case 'define':
        if ((this.val.length !== 3) || !(this.val[1] instanceof SchemeAtom)) {
          throw new SchemeError('Form of define is (define <name> <expr>)');
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
      case 'if':
        if (this.val.length !== 4) {
          throw new SchemeError('Form of if is (if <test-expr> <expr-if-true> <expr-if-false>)');
        }
        var predicate = this.val[1].eval(env);
        if (!(predicate instanceof SchemeBool))
          throw new SchemeError('expecting boolean. Found ' + predicate.toString());
        if (predicate.val)
          return this.val[2].eval(env);
        return this.val[3].eval(env);
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

/*
 * Type names
 */

SchemeAtom.typeName = function () { return '<symbol>'; };
SchemeString.typeName = function () { return '<string>'; };
SchemeBool.typeName = function () { return '<boolean>'; };
SchemeNum.typeName = function () { return '<numeric>'; };
SchemeList.typeName = function () { return '<list>'; };
SchemeDottedList.typeName = function () { return '<list>'; };
SchemePrimativeFunction.typeName = function () { return '<function>'; };
SchemeUserFunction.typeName = function () { return '<function>'; };

