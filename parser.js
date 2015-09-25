module.exports = Parser;

function Parser () {
  if (! this instanceof Parser) {
    return new Parser();
  }
}

Parser.prototype.parse = function () {
  throw (new Error('Impliment in subclass'));
};

Parser.prototype.procResult = function (fn) {
  var fiddled = new Parser();
  var self = this;
  fiddled.parse = function (str, successCb, failCb) {
    self.parse(str,
    function (acc, str2) {
      successCb(fn(acc), str2);
    },
    function (err) {
      failCb(err);
    })
  };
  return fiddled;
};

Parser.prototype.andReturn = function (val) {
  var fiddled = new Parser();
  var self = this;
  fiddled.parse = function (str, successCb, failCb) {
    self.parse(str,
    function (acc, str2) {
      successCb([val], str2);
    },
    function (err) {
      failCb(err);
    })
  };
  return fiddled;
}

Parser.prototype.then = function (next) {
  var combined = new Parser(),
      self = this;

  combined.parse = function (str, successCb, failCb) {
    self.parse(str,
    function (acc, str2) {
      next.parse(str2,
      function (acc2, str3) {
        successCb(acc.concat(acc2), str3);
      },
      function (err) {
        failCb(err);
      });
    },
    function (err) {
      failCb(err);
    });
  };

  return combined;
};

Parser.prototype.or = function (alt) {
  var combined = new Parser()
      self = this;

  combined.parse = function (str, sCb, fCb) {
    self.parse(str, sCb,
    function (err) {
      alt.parse(str, sCb, function (err2) {
        fCb(err.concat(err2));
      });
    });
  };

  return combined;
};

Parser.matchStr = function (matchStr) {
  var matcher = new Parser();
  matcher.parse = function (str, successCb, failCb) {
    if (str.slice(0, matchStr.length) === matchStr) {
      successCb([matchStr], str.slice(matchStr.length))
    } else {
      failCb([matchStr]);
    }
  };
  return matcher;
};

Parser.numericChar = function () {
  var matcher = new Parser();
  matcher.parse = function (str, sCb, fCb) {
    if (str[0] >= '0' && str[0] <= '9') {
      sCb([str[0]], str.slice(1));
    } else {
      fCb(['Numeral 0,..,9']);
    }
  };
  return matcher;
}

Parser.alphaChar = function () {
  var matcher = new Parser();
  matcher.parse = function (str, sCb, fCb) {
    if ((str[0] >= 'a' && str[0] <= 'z') || (str[0] >= 'A' && str[0] <= 'Z')) {
      sCb([str[0]], str.slice(1));
    } else {
      fCb(['A..Z,a..z']);
    }
  };
  return matcher;
}

Parser.many = function (m) {
  var matcher = new Parser();
  matcher.parse = function (str, sCb, fCb) {
    m.parse(str,
    function (acc, strRem) {
      Parser.many(m).parse(strRem,
      function (acc2, strRem2) {
        sCb(acc.concat(acc2), strRem2);
      });
    },
    function (err) {
      sCb([], str);
    })
  };
  return matcher;
};

Parser.many1 = function (m) {
  return m.then(Parser.many(m));
};
