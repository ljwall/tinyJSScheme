var types = require('../schemeTypes.js'),
    pasreScheme = require('../parseScheme.js');

describe('pasreScheme', function () {
  it('should match Atoms', function (done) {
    pasreScheme('foo->bar1$')
    .then(function (res) {
      expect(res.matched[0]).toEqual(new types.SchemeAtom('foo->bar1$'));
      expect(res.remaining).toEqual('');
    })
    .catch(done.fail)
    .done(done);
  });

  it('should match Strings', function (done) {
    pasreScheme('"Foo\\tBar\\n\\"Spam"rest')
    .then(function (res) {
      expect(res.matched[0]).toEqual(new types.SchemeString('Foo\tBar\n"Spam'));
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });

  it('should match #t as true', function (done) {
    pasreScheme('#trest')
    .then(function (res) {
      expect(res.matched[0]).toEqual(new types.SchemeBool(true));
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match #f as false', function (done) {
    pasreScheme('#frest')
    .then(function (res) {
      expect(res.matched[0]).toEqual(new types.SchemeBool(false));
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match integers', function (done) {
    pasreScheme('123rest')
    .then(function (res) {
      expect(res.matched[0]).toEqual(new types.SchemeNum(123));
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match decimals', function (done) {
    pasreScheme('123.456rest')
    .then(function (res) {
      expect(res.matched[0]).toEqual(new types.SchemeNum(123.456));
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match lists', function (done) {
    pasreScheme('(2.718 #t "hello" foo)rest')
    .then(function (res) {
      expect(res.matched[0]).toEqual(
        new types.SchemeList([
          new types.SchemeNum(2.718),
          new types.SchemeBool(true),
          new types.SchemeString('hello'),
          new types.SchemeAtom('foo')
        ])
      );
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match nestesd list', function (done) {
    pasreScheme('(2.718 (#t "hello") foo)rest')
    .then(function (res) {
      expect(res.matched[0]).toEqual(
        new types.SchemeList([
          new types.SchemeNum(2.718),
          new types.SchemeList([
            new types.SchemeBool(true),
            new types.SchemeString("hello")
          ]),
          new types.SchemeAtom('foo')
        ])
      );
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match empty list', function (done) {
    pasreScheme('()rest')
    .then(function (res) {
      expect(res.matched[0]).toEqual(new types.SchemeList([]));
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match qutoed lists', function (done) {
    pasreScheme('\'(foo)rest')
    .then(function (res) {
      expect(res.matched[0]).toEqual(
        new types.SchemeList([
          new types.SchemeAtom('quoted'),
          new types.SchemeList([new types.SchemeAtom('foo')])
        ]));

      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
});
