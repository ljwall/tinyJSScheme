(function (modFactory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = modFactory(require('bluebird'));
  } else if (typeof define === "function" && define.amd) {
    define(['bluebird'], modFactory);
  } else {
    throw new Error('Use a module loader!');
  }
}(function (Promise) {
  function ParseError (val) {
    if (typeof val === 'string') {
      this.expecting = [val];
    } else {
      this.expecting = val;
    }
  }
  ParseError.prototype = new Error(); //Object.create(Error.prototype);

  function Parser (fn) {
    if (! (this instanceof Parser)) {
      return new Parser();
    }
    this.parse = fn;
  }

  Parser.ParseError = ParseError;

  Parser.prototype.map = function (fn) {
    var self = this;
    return new Parser(function (str) {
      return self.parse(str)
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
    return new Parser(function (str) {
      return self.parse(str)
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
    return new Parser(function (str) {
      return self.parse(str).tap(fn);
    });
  };
  Parser.prototype.then = function (fn) {
    var self = this;
    return new Parser(function (str) {
      return self.parse(str).then(function (res) {
        return {
          matched: fn(res.matched),
          remaining: res.remaining
        };
      });
    });
  };

  Parser.prototype.andReturn = function (val) {
    var self = this;
    return  new Parser(function (str) {
      return self.parse(str)
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
    return new Parser(function (str) {
      var prefixPromise = self.parse(str),
          matchedFirst;

      return prefixPromise
      .then(function (prefixMatch) {
        matchedFirst = prefixMatch.matched;
        return next.parse(prefixMatch.remaining);
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
    return new Parser(function (str) {
      return self.parse(str)
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

    return new Parser(function (str) {
      var errors;

      return self.parse(str)
      .catch(ParseError, function (err) {
        errors = err.expecting;
        return alt.parse(str);
      })
      .catch(ParseError, function (err) {
        return Promise.reject(new ParseError(errors.concat(err.expecting)));
      });
    });
  };

  Parser.matchStr = function (matchStr) {
    return new Parser(function (str) {
      if (str.slice(0, matchStr.length) === matchStr) {
        return Promise.resolve({
          matched: [matchStr],
          remaining: str.slice(matchStr.length)
        });
      } else {
        return Promise.reject(new ParseError(matchStr));
      }
    });
  };

  Parser.numericChar =
    new Parser(function (str) {
      if (str[0] >= '0' && str[0] <= '9') {
        return Promise.resolve({
          matched: [str[0]],
          remaining: str.slice(1)
        });
      } else {
        return Promise.reject(new ParseError(['Numeral 0,..,9']));
      }
    });

  Parser.alphaChar =
    new Parser(function (str) {
      if ((str[0] >= 'a' && str[0] <= 'z') || (str[0] >= 'A' && str[0] <= 'Z')) {
        return Promise.resolve({
          matched: [str[0]],
          remaining: str.slice(1)
        });
      } else {
        return Promise.reject(new ParseError('A..Z,a..z'));
      }
    });


  Parser.many = function (m) {
    return new Parser(function (str) {
      var first;
      return m.parse(str)
      .then(function (res) {
        first = res.matched;
        return Parser.many(m).parse(res.remaining);
      })
      .then(function (res) {
        return {
          matched: first.concat(res.matched),
          remaining: res.remaining
        };
      })
      .catch(ParseError, function (err) {
        return {
          matched: [],
          remaining: str
        };
      });
    });
  };

  Parser.maybe = function (m) {
    return new Parser(function (str) {
      return m.parse(str)
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
    return new Parser(function (str) {
      for (var i=0; i < matchChars.length; i++) {
        if (str.slice(0, 1) === matchChars[i]) {
          return Promise.resolve({
            matched: [matchChars[i]],
            remaining: str.slice(1)
          });
        }
      }
      return Promise.reject(new ParseError('One of: ' + matchChars));
    });
  };

  Parser.noneOfChars = function (matchChars) {
    return new Parser(function (str) {
      for (var i=0; i < matchChars.length; i++) {
        if (str[0] === matchChars[i]) {
          return Promise.reject(new ParseError(matchChars[i]));
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
