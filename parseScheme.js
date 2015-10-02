var Parser = require('./parser.js'),
    type = require('./schemeTypes.js');

module.exports = parseLispExpr;

function strconcat (a, b) {return a+b;};

var parseSpecialChars =  Parser.oneOfChars('\'-<>?=!$~');

var parseAtom =
  Parser.alphaChar
  .followedBy(
    Parser.many(
      parseSpecialChars
      .or(Parser.alphaChar)
      .or(Parser.numericChar)))
  .reduce(strconcat, '')
  .map(function (str) {return new type.SchemeAtom(str)});

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
  .map(function (str) {return new type.SchemeString(str)});

var parseTrue =
  Parser.matchStr('#t')
  .andReturn(new type.SchemeBool(true));

var parseFalse =
  Parser.matchStr('#f')
  .andReturn(new type.SchemeBool(false));

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
  .map(function (num) {return new type.SchemeNum(num)});

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
  .then(function(res) { return [new type.SchemeList(res)]; });

var parseQutoedExpr =
  Parser.matchStr('\'')
  .squash()
  .followedBy(new Parser(function (str) {
    return parseExpr.parse(str);
  }))
  .then(function (res) {
    return [new type.SchemeList([new type.SchemeAtom('quoted'), res[0]])]
  });

var parseExpr = parseAtom
  .or(parseString)
  .or(parseBool)
  .or(parseNum)
  .or(parseList)
  .or(parseQutoedExpr);


function parseLispExpr (str) {
  return parseExpr.parse(str);
}
