var parseScheme = require('./parseScheme.js'),
    scheme = require('./schemeTypes');

var parseExpr = function (str) {
  return parseScheme(str)
  .then(function (res) {
    return res.matched[0];
  });
};

var exprStr = '(+ (- (* 2 2) (/ 10 10)) (* (- 1002 1000) (/ 49 7)))';

parseExpr(exprStr)
.then(function (expr) {
  console.log('>>', exprStr)
  console.log(expr.eval(scheme.globalEnv));
})
.catch(function (err) {
   console.log('Error:', err);
});
