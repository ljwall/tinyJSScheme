var scheme = require('../lib/scheme.js'),
    parseScheme = require('../lib/parseScheme.js');

describe('parseScheme', function () {
  it('should match Atoms', function (done) {
    parseScheme('foo->bar1$')
    .then(function (res) {
      expect(res.matched[0]).toEqual(new scheme.SchemeAtom('foo->bar1$'));
      expect(res.remaining).toEqual('');
    })
    .catch(done.fail)
    .done(done);
  });

  it('should match Strings', function (done) {
    parseScheme('"Foo\\tBar\\n\\"Spam"rest')
    .then(function (res) {
      expect(res.matched[0]).toEqual(new scheme.SchemeString('Foo\tBar\n"Spam'));
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });

  it('should match #t as true', function (done) {
    parseScheme('#trest')
    .then(function (res) {
      expect(res.matched[0]).toEqual(new scheme.SchemeBool(true));
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match #f as false', function (done) {
    parseScheme('#frest')
    .then(function (res) {
      expect(res.matched[0]).toEqual(new scheme.SchemeBool(false));
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match integers', function (done) {
    parseScheme('123rest')
    .then(function (res) {
      expect(res.matched[0]).toEqual(new scheme.SchemeNum(123));
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match decimals', function (done) {
    parseScheme('123.456rest')
    .then(function (res) {
      expect(res.matched[0]).toEqual(new scheme.SchemeNum(123.456));
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match lists', function (done) {
    parseScheme('(2.718 #t "hello" foo)rest')
    .then(function (res) {
      expect(res.matched[0]).toEqual(
        new scheme.SchemeList([
          new scheme.SchemeNum(2.718),
          new scheme.SchemeBool(true),
          new scheme.SchemeString('hello'),
          new scheme.SchemeAtom('foo')
        ])
      );
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match nestesd list', function (done) {
    parseScheme('(2.718 (#t "hello") foo)rest')
    .then(function (res) {
      expect(res.matched[0]).toEqual(
        new scheme.SchemeList([
          new scheme.SchemeNum(2.718),
          new scheme.SchemeList([
            new scheme.SchemeBool(true),
            new scheme.SchemeString("hello")
          ]),
          new scheme.SchemeAtom('foo')
        ])
      );
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match empty list', function (done) {
    parseScheme('()rest')
    .then(function (res) {
      expect(res.matched[0]).toEqual(new scheme.SchemeList([]));
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match qutoed lists', function (done) {
    parseScheme('\'(foo)rest')
    .then(function (res) {
      expect(res.matched[0]).toEqual(
        new scheme.SchemeList([
          new scheme.SchemeAtom('quoted'),
          new scheme.SchemeList([new scheme.SchemeAtom('foo')])
        ]));

      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });

  it('should parse dotted lists correctly', function (done) {
    parseScheme('(1 2 3 . 4)')
    .then(function (res) {
      expect(res.matched[0]).toEqual(
        new scheme.SchemeDottedList([
          new scheme.SchemeNum(1),
          new scheme.SchemeNum(2),
          new scheme.SchemeNum(3)
        ], new scheme.SchemeNum(4))
      );
    })
    .catch(done.fail)
    .done(done);
  });

  it('should parse (bar 1 (foo 2)) correctly', function (done) {
    parseScheme('(bar 1 (foo 2))')
    .then(function (res) {
      expect(res.matched[0]).toEqual(
        new scheme.SchemeList([
          new scheme.SchemeAtom('bar'),
          new scheme.SchemeNum(1),
          new scheme.SchemeList([
            new scheme.SchemeAtom('foo'),
            new scheme.SchemeNum(2)
          ])
        ]));
    })
    .catch(done.fail)
    .done(done);
  });
});
