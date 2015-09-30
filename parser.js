var Promise = require('bluebird');

module.exports = Parser;

function ParseError (val) {
  if (typeof val === 'string') {
    this.expecting = [val];
  } else {
    this.expecting = val;
  }
}

/* Wrapper for use in catch blocks whcih should
 * catch ParseError but not other errors */
filterParseError = function (fn) {
  return function (err) {
    if (err instanceof ParseError) {
      return fn(err);
    } else {
      throw err;
    }
  }
};


function Parser () {
  if (! this instanceof Parser) {
    return new Parser();
  }
}

Parser.prototype.parse = function () {
  throw (new Error('Impliment in subclass'));
};

Parser.prototype.map = function (fn) {
  var fiddled = new Parser();
  var self = this;
  fiddled.parse = function (str) {
    return self.parse(str)
    .then(function (res) {
      return {
        matched: res.matched.map(fn),
        remaining: res.remaining
      }
    });
  };
  return fiddled;
};

Parser.prototype.andReturn = function (val) {
  var fiddled = new Parser();
  var self = this;

  fiddled.parse = function (str) {
    return self.parse(str)
    .then(function (res) {
      return {
        matched: [val],
        remaining: res.remaining
      }
    });
  };

  return fiddled;
};

Parser.prototype.followedBy = function (next) {
  var combined = new Parser(),
      self = this;

  combined.parse = function (str) {
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
    })
    /* do not catch - if promise rejects return rejection */
  };

  return combined;
};

Parser.prototype.squash = function () {
  var modified = new Parser()
      self = this;
  modified.parse = function (str) {
    return self.parse(str)
    .then(function (res) {
      return {
        matched: [],
        remaining: res.remaining
      }
    });
  };
  return modified;
};

Parser.prototype.or = function (alt) {
  var combined = new Parser(),
      self = this;

  combined.parse = function (str) {
    var errors;

    return self.parse(str)
    .catch(filterParseError(function (err) {
      errors = err.expecting;
      return alt.parse(str);
    }))
    .catch(filterParseError(function (err) {
      return Promise.reject(new ParseError(errors.concat(err.expecting)));
    }))
  };

  return combined;
};

Parser.matchStr = function (matchStr) {
  var matcher = new Parser();
  matcher.parse = function (str) {
    if (str.slice(0, matchStr.length) === matchStr) {
      return Promise.resolve({
        matched: [matchStr],
        remaining: str.slice(matchStr.length)
      });
    } else {
      return Promise.reject(new ParseError(matchStr));
    }
  };
  return matcher;
};

Parser.numericChar = function () {
  var matcher = new Parser();
  matcher.parse = function (str) {
    if (str[0] >= '0' && str[0] <= '9') {
      return Promise.resolve({
        matched: [str[0]],
        remaining: str.slice(1)
      });
    } else {
      return Promise.reject(new ParseError(['Numeral 0,..,9']));
    }
  };
  return matcher;
};

Parser.alphaChar = function () {
  var matcher = new Parser();
  matcher.parse = function (str) {
    if ((str[0] >= 'a' && str[0] <= 'z') || (str[0] >= 'A' && str[0] <= 'Z')) {
      return Promise.resolve({
        matched: [str[0]],
        remaining: str.slice(1)
      });
    } else {
      return Promise.reject(new ParseError('A..Z,a..z'));
    }
  };
  return matcher;
};


Parser.many = function (m) {
  var matcher = new Parser(),
      first;
  matcher.parse = function (str) {
    return m.parse(str)
    .then(function (res) {
      first = res.matched;
      return Parser.many(m).parse(res.remaining)
    })
    .then(function (res) {
      return {
        matched: first.concat(res.matched),
        remaining: res.remaining
      }
    })
    .catch(filterParseError(function (err) {
      return {
        matched: [],
        remaining: str
      }
    }));
  };
  return matcher;
};

Parser.maybe = function (m) {
  var matcher = new Parser();

  matcher.parse = function (str) {
    return m.parse(str)
    .catch(filterParseError(function (err) {
      return {
        matched: [],
        remaining: str
      }
    }));
  };

  return matcher;
};
