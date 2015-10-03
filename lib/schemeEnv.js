var s = require('./scheme.js'),
    schemeEnv = {};

module.exports = schemeEnv;

function wrapBinFn(fn, acceptType, returnType) {
  if (returnType === undefined) {
    returnType = acceptType;
  }
  return new s.SchemePrimativeFunction(function (a, b) {
    if (arguments.length !== 2) {
      throw new s.SchemeError('Expecting two arguments');
    }
    if ((!(a instanceof acceptType)) || (!(b instanceof acceptType))) {
      throw new s.SchemeError('Expecting ' + acceptType.typeName());
    }
    return new returnType(fn(a.val, b.val));
  });
}

/* Basic numerics */
schemeEnv['+'] = wrapBinFn(function(a, b) {return a+b; }, s.SchemeNum);
schemeEnv['*'] = wrapBinFn(function(a, b) {return a*b; }, s.SchemeNum);
schemeEnv['-'] = wrapBinFn(function(a, b) {return a-b; }, s.SchemeNum);
schemeEnv['/'] = wrapBinFn(function(a, b) {return a/b; }, s.SchemeNum);

schemeEnv['>'] = wrapBinFn(function(a, b) {return a>b; }, s.SchemeNum, s.SchemeBool);
schemeEnv['<'] = wrapBinFn(function(a, b) {return a<b; }, s.SchemeNum, s.SchemeBool);
schemeEnv['>='] = wrapBinFn(function(a, b) {return a>=b; }, s.SchemeNum, s.SchemeBool);
schemeEnv['<='] = wrapBinFn(function(a, b) {return a<=b; }, s.SchemeNum, s.SchemeBool);

/* Boolean operators */
schemeEnv['&&'] = wrapBinFn(function(a, b) {return a && b; }, s.SchemeBool);
schemeEnv['||'] = wrapBinFn(function(a, b) {return a || b; }, s.SchemeBool);

/* Equality */

function recursiveEquals (a, b) {
  if ((a instanceof s.SchemeAtom) ||
      (a instanceof s.SchemeString) ||
      (a instanceof s.SchemeBool) ||
      (a instanceof s.SchemeNum)) {
    return (Object.getPrototypeOf(a) === Object.getPrototypeOf(b)) &&
              (a.val === b.val);
  }

  if (a instanceof s.SchemeList) {
    if (!(b instanceof s.SchemeList) || a.val.length !== b.val.length)
     return false;

    return a.val.every(function (aItem, i) {
      return recursiveEquals(aItem, b.val[i]);
    });
  }

  if (a instanceof s.SchemeDottedList) {
    if (!(b instanceof s.SchemeDottedList) || a.list.length !== b.list.length)
      return false;

    return recursiveEquals(a.last, b.last) && a.list.every(function (aItem, i) {
      return recursiveEquals(aItem, b.list[i]);
    });
  }

  if (a instanceof s.SchemePrimativeFunction) {
    return (b instanceof s.SchemePrimativeFunction) && (a === b);
  }

  if (a instanceof s.SchemeUserFunction) {
    return (b instanceof s.SchemeUserFunction) && (a === b);
  }
}

schemeEnv['=='] = new s.SchemePrimativeFunction(function (a, b) {
  return new s.SchemeBool(recursiveEquals(a, b));
});

/* Standard list functions */

schemeEnv.head = schemeEnv.car = new s.SchemePrimativeFunction(function (list) {
  if (list instanceof s.SchemeList && list.val.length > 0) {
    return list.val[0];
  } else if (list instanceof s.SchemeDottedList) {
    return list.list[0];
  } else {
    throw new s.SchemeError('Non-empty list expected.\nFound ' + list.toString());
  }
});

schemeEnv.tail = schemeEnv.cdr = new s.SchemePrimativeFunction(function (list) {
  if (list instanceof s.SchemeList && list.val.length > 0) {
    return new s.SchemeList(list.val.slice(1));
  } else if (list instanceof s.SchemeDottedList) {
    if (list.list.length > 1) {
      return new s.SchemeDottedList(list.list.slice(1), list.last);
    } else {
      return list.last;
    }
  } else {
    throw new s.SchemeError('Non-empty list expected.\nFound ' + list.toString());
  }
});

schemeEnv.cons = new s.SchemePrimativeFunction(function (fst, snd) {
  if (snd instanceof s.SchemeList) {
    return new s.SchemeList([fst].concat(snd.val));
  } else if (snd instanceof s.SchemeDottedList) {
    return new s.SchemeDottedList([fst].concat(snd.list), snd.last);
  } else {
    return new s.SchemeDottedList([fst], snd);
  }
});

