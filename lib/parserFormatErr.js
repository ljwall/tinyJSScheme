(function (modFactory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = modFactory();
  } else if (typeof define === "function" && define.amd) {
    define(modFactory);
  } else {
    throw new Error('Use a module loader!');
  }
}(function () {
  function repeat (str, count) {
    var rpt = '';
    for (;;) {
      if ((count & 1) == 1) {
        rpt += str;
      }
      count >>>= 1;
      if (count == 0) {
        break;
      }
      str += str;
    }
    return rpt;
  }
  /*
   * Takes a string and aparse error object generated while parsing
   * that string and makes a nice error message to print.
   */
  return function (origStr, err) {
    if (err.expecting[0].context.length === 0) {
      return 'Unexpected end of input. (Check that brackets and "quotes" are balanced.)';
    }

    var parsed = origStr.slice(0, -err.expecting[0].context.length),
        parsedLines = parsed.split('\n'),
        remainingLines = err.expecting[0].context.split('\n');

    return 'Parse error on line ' + parsedLines.length + '\n' +
      parsedLines[parsedLines.length - 1] + remainingLines[0] + '\n' +
      repeat('_', parsedLines[parsedLines.length - 1].length) +
      '^' + repeat('_', remainingLines[0].length-1);

  };
}));
