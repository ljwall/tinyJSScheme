(function (modFactory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = modFactory(require('bluebird'));
  } else if (typeof define === "function" && define.amd) {
    define(['bluebird'], modFactory);
  } else {
    throw new Error('Use a module loader!');
  }
}(function (Promise) {
  function ParseError (val, context) {
    this.expecting = [val];
    this.context = context;
  }
  ParseError.prototype = new Error();
  ParseError.prototype.join = function (val, context) {
    if (context.length === this.context.length) {
      if (this.expecting.every(function (item) {return item!==val;})) {
        this.expecting.push(val);
      }
    } else if (context.length < this.context.length) {
      this.expecting = [val];
      this.context = context;
    }
    return this;
  };

  ParseError.createFactory = function () {
    var runningError;
    return function (val, context) {
      if (!runningError) {
        runningError = new ParseError(val, context);
      } else {
        runningError.join(val, context);
      }
      return runningError;
    }
  };

  function Parser (fn) {
    if (! (this instanceof Parser)) {
      return new Parser(fn);
    }
    this.parse = function (str, errorFactory) {
      errorFactory = errorFactory || ParseError.createFactory();
      return fn(str, errorFactory);
    };
  }

  Parser.ParseError = ParseError;

  Parser.prototype.map = function (fn) {
    var self = this;
    return new Parser(function (str, errorFactory) {
      return self.parse(str, errorFactory)
      .then(function (res) {
        return {
          matched: res.matched.map(fn),
          remaining: res.remaining
        };
      });
    });
  };

  Parser.prototype.reduce = function (fn, init) {
    var self = this;
    return new Parser(function (str, errorFactory) {
      return self.parse(str, errorFactory)
      .then(function (res) {
        return {
          matched: [res.matched.reduce(fn, init)],
          remaining: res.remaining
        };
      });
    });
  };

  Parser.prototype.tap = function (fn) {
    var self = this;
    return new Parser(function (str, errorFactory) {
      return self.parse(str, errorFactory).tap(fn);
    });
  };
  Parser.prototype.then = function (fn) {
    var self = this;
    return new Parser(function (str, errorFactory) {
      return self.parse(str, errorFactory).then(function (res, errorFactory) {
        return {
          matched: fn(res.matched),
          remaining: res.remaining
        };
      });
    });
  };

  Parser.prototype.andReturn = function (val) {
    var self = this;
    return  new Parser(function (str, errorFactory) {
      return self.parse(str, errorFactory)
      .then(function (res) {
        return {
          matched: [val],
          remaining: res.remaining
        };
      });
    });
  };

  Parser.prototype.followedBy = function (next) {
    var self = this;
    return new Parser(function (str, errorFactory) {
      var prefixPromise = self.parse(str, errorFactory),
          matchedFirst;

      return prefixPromise
      .then(function (prefixMatch) {
        matchedFirst = prefixMatch.matched;
        return next.parse(prefixMatch.remaining, errorFactory);
      })
      .then(function (suffixMatch) {
        return {
          matched: matchedFirst.concat(suffixMatch.matched),
          remaining: suffixMatch.remaining
        };
      });
      /* do not catch - if promise rejects return rejection */
    });
  };

  Parser.prototype.squash = function () {
    var self = this;
    return new Parser(function (str, errorFactory) {
      return self.parse(str, errorFactory)
      .then(function (res) {
        return {
          matched: [],
          remaining: res.remaining
        };
      });
    });
  };

  Parser.prototype.or = function (alt) {
    var self = this;

    return new Parser(function (str, errorFactory) {
      return self.parse(str, errorFactory)
      .catch(ParseError, function (err) {
        return alt.parse(str, errorFactory);
      })
    });
  };

  Parser.matchStr = function (matchStr) {
    return new Parser(function (str, errorFactory) {
      if (str.slice(0, matchStr.length) === matchStr) {
        return Promise.resolve({
          matched: [matchStr],
          remaining: str.slice(matchStr.length)
        });
      } else {
        return Promise.reject(errorFactory(matchStr, str));
      }
    });
  };

  Parser.numericChar =
    new Parser(function (str, errorFactory) {
      if (str[0] >= '0' && str[0] <= '9') {
        return Promise.resolve({
          matched: [str[0]],
          remaining: str.slice(1)
        });
      } else {
        return Promise.reject(errorFactory('Numeral 0,..,9', str));
      }
    });

  Parser.alphaChar =
    new Parser(function (str, errorFactory) {
      if ((str[0] >= 'a' && str[0] <= 'z') || (str[0] >= 'A' && str[0] <= 'Z')) {
        return Promise.resolve({
          matched: [str[0]],
          remaining: str.slice(1)
        });
      } else {
        return Promise.reject(errorFactory('A..Z,a..z', str));
      }
    });

  Parser.many = function (m) {
    return new Parser(function (str, errorFactory) {
      return m.followedBy(Parser.many(m))
      .parse(str, errorFactory)
      .catch(ParseError, function (err) {
        return {
          matched: [],
          remaining: str
        };
      });
    });
  }

  Parser.maybe = function (m) {
    return new Parser(function (str, errorFactory) {
      return m.parse(str, errorFactory)
      .catch(ParseError, function (err) {
        return {
          matched: [],
          remaining: str
        };
      });
    });
  };

  Parser.sepBy = function (sep, m) {
    var compound = sep.squash().followedBy(m);
    return m.followedBy(Parser.many(compound));
  };

  Parser.oneOfChars = function (matchChars) {
    return new Parser(function (str, errorFactory) {
      for (var i=0; i < matchChars.length; i++) {
        if (str.slice(0, 1) === matchChars[i]) {
          return Promise.resolve({
            matched: [matchChars[i]],
            remaining: str.slice(1)
          });
        }
      }
      return Promise.reject(errorFactory('One of: ' + matchChars, str));
    });
  };

  Parser.noneOfChars = function (matchChars) {
    return new Parser(function (str, errorFactory) {
      if (str.length === 0) {
        return Promise.reject(errorFactory('a character', str));
      }
      for (var i=0; i < matchChars.length; i++) {
        if (str[0] === matchChars[i]) {
          return Promise.reject(errorFactory(matchChars[i], str));
        }
      }
      return Promise.resolve({
        matched: [str[0]],
        remaining: str.slice(1)
      });
    });
  };

  return Parser;
}));
