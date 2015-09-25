Parser = require('../parser.js');

describe('Parser', function () {
  describe('matchStr', function () {
    it('should match a string', function () {
      var m = Parser.matchStr('Foo'),
          sCb = jasmine.createSpy(),
          fCb = jasmine.createSpy();
      m.parse('FooBar!', sCb, fCb);
      expect(sCb).toHaveBeenCalledWith(['Foo'], 'Bar!');
      expect(fCb).not.toHaveBeenCalled();
    });
    it('should fail if no match', function () {
      var m = Parser.matchStr('Foo'),
          sCb = jasmine.createSpy(),
          fCb = jasmine.createSpy();
      m.parse('BarFoo!', sCb, fCb);
      expect(fCb).toHaveBeenCalledWith(['Foo']);
      expect(sCb).not.toHaveBeenCalled();
    });
  });
});
