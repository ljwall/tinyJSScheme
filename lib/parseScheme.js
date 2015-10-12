(function (modFactory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = modFactory(require('./parser'), require('./scheme'));
  } else if (typeof define === "function" && define.amd) {
    define(['./parser', './scheme'], modFactory);
  } else {
    throw new Error('Use a module loader!');
  }
}(function (Parser, scheme) {
  function strconcat (a, b) {return a+b;}

  var parseSpecialChar =  Parser.oneOfChars('&|-<>?=!$~+*\\/');

  var parseAtom =
    Parser.alphaChar
    .or(parseSpecialChar)
    .followedBy(
        Parser.many(
          parseSpecialChar
          .or(Parser.alphaChar)
          .or(Parser.numericChar)))
    .reduce(strconcat, '')
    .map(function (str) {return new scheme.SchemeAtom(str); });

  var parseString =
    Parser.matchStr('"').squash()
    .followedBy(
        Parser.many(
          Parser.noneOfChars('\\"')
          .or(Parser.matchStr('\\"').andReturn('"'))
          .or(Parser.matchStr('\\n').andReturn('\n'))
          .or(Parser.matchStr('\\t').andReturn('\t'))
          .or(Parser.matchStr('\\r').andReturn('\r'))
          )
        )
    .followedBy(Parser.matchStr('"').squash())
    .reduce(strconcat, '')
    .map(function (str) {return new scheme.SchemeString(str); } );

  var parseTrue =
    Parser.matchStr('#t')
    .andReturn(new scheme.SchemeBool(true));

  var parseFalse =
    Parser.matchStr('#f')
    .andReturn(new scheme.SchemeBool(false));

  var parseBool = parseTrue.or(parseFalse);

  var parseNum =
    Parser.numericChar
    .followedBy(Parser.many(Parser.numericChar))
    .followedBy(
        Parser.maybe(
          Parser.matchStr('.')
          .followedBy(Parser.many(Parser.numericChar))
          )
        )
    .reduce(strconcat, '')
    .map(parseFloat)
    .map(function (num) {return new scheme.SchemeNum(num); });

  var parseComment = Parser.matchStr(';;')
    .followedBy(Parser.many(Parser.noneOfChars('\n')))
    .followedBy(Parser.matchStr('\n'));
  var parseWhiteSpace = Parser.many(parseComment.or(Parser.oneOfChars(' \n\r\t')));

  var parseNullList =
    Parser.matchStr('()')
    .andReturn(new scheme.SchemeList([]));

  var parseListStart =
    Parser.matchStr("(")
    .followedBy(Parser.maybe(parseWhiteSpace))
    .squash()
    .followedBy(Parser.sepBy(parseWhiteSpace,
          new Parser(function (str) {
            return parseExpr.parse(str);
          })
          ));

  var parseList =
    parseListStart
    .followedBy(Parser.maybe(parseWhiteSpace).squash())
    .followedBy(Parser.matchStr(')').squash())
    .then(function(res) { return [new scheme.SchemeList(res)]; });

  var parseDottedList =
    parseListStart
    .followedBy(parseWhiteSpace.squash())
    .followedBy(Parser.matchStr('.').squash())
    .followedBy(parseWhiteSpace.squash())
    .followedBy(new Parser(function (str) {
      return parseExpr.parse(str);
    }))
  .followedBy(Parser.maybe(parseWhiteSpace).squash())
    .followedBy(Parser.matchStr(')').squash())
    .then(function(res) { return [new scheme.SchemeDottedList(res.slice(0, -1), res[res.length-1])]; });

  var parseQuotedExpr =
    Parser.matchStr('\'')
    .squash()
    .followedBy(new Parser(function (str) {
      return parseExpr.parse(str);
    }))
  .then(function (res) {
    return [new scheme.SchemeList([new scheme.SchemeAtom('quoted'), res[0]])];
  });

  var parseExpr = parseAtom
    .or(parseString)
    .or(parseBool)
    .or(parseNum)
    .or(parseNullList)
    .or(parseList)
    .or(parseDottedList)
    .or(parseQuotedExpr);

  function parseLispExprList (str) {
    return Parser.maybe(parseWhiteSpace).squash()
      .followedBy(Parser.sepBy(parseWhiteSpace, parseExpr))
      .followedBy(Parser.maybe(parseWhiteSpace).squash())
      .parse(str);
  }

  function parseLispExpr (str) {
    return Parser.maybe(parseWhiteSpace).squash()
      .followedBy(parseExpr)
      .followedBy(Parser.maybe(parseWhiteSpace).squash())
      .parse(str);
  }

  return {
    one: parseLispExpr,
    many: parseLispExprList,
    ParseError: Parser.ParseError
  };
}));
