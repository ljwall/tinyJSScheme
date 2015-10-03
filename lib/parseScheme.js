var Parser = require('./parser.js'),
    scheme = require('./scheme.js');

module.exports = parseLispExpr;

function strconcat (a, b) {return a+b;};

var parseSpecialChar =  Parser.oneOfChars('-<>?=!$~+*\\/');

var parseAtom =
  Parser.alphaChar
  .or(parseSpecialChar)
  .followedBy(
    Parser.many(
      parseSpecialChar
      .or(Parser.alphaChar)
      .or(Parser.numericChar)))
  .reduce(strconcat, '')
  .map(function (str) {return new scheme.SchemeAtom(str)});

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
  .map(function (str) {return new scheme.SchemeString(str)});

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
  .map(function (num) {return new scheme.SchemeNum(num)});

var parseWhiteSpace = Parser.many(Parser.oneOfChars(' \n\r\t'));

var parseList =
  Parser.matchStr("(")
  .followedBy(Parser.maybe(parseWhiteSpace))
  .squash()
  .followedBy(Parser.maybe(Parser.sepBy(parseWhiteSpace,
    new Parser(function (str) {
      return parseExpr.parse(str);
    })
  )))
  .followedBy(
    Parser.matchStr(')')
    .squash()
  )
  .then(function(res) { return [new scheme.SchemeList(res)]; });


var parseQuotedExpr =
  Parser.matchStr('\'')
  .squash()
  .followedBy(new Parser(function (str) {
    return parseExpr.parse(str);
  }))
  .then(function (res) {
    return [new scheme.SchemeList([new scheme.SchemeAtom('quoted'), res[0]])]
  });

var parseExpr = parseAtom
  .or(parseString)
  .or(parseBool)
  .or(parseNum)
  .or(parseList)
  .or(parseQuotedExpr);


function parseLispExpr (str) {
  return parseExpr.parse(str);
}
