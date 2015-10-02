var types = require('../schemeTypes.js'),
    pasreScheme = require('../parseScheme.js');

describe('pasreScheme', function () {
  it('should match Atoms', function (done) {
    pasreScheme('foo->bar1$')
    .then(function (res) {
      expect(res.matched[0] instanceof types.SchemeAtom).toBe(true);
      expect(res.matched[0].val).toEqual('foo->bar1$');
      expect(res.remaining).toEqual('');
    })
    .catch(done.fail)
    .done(done);
  });

  it('should match Strings', function (done) {
    pasreScheme('"Foo\\tBar\\n\\"Spam"rest')
    .then(function (res) {
      expect(res.matched[0] instanceof types.SchemeString).toBe(true);
      expect(res.matched[0].val).toEqual('Foo\tBar\n"Spam');
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });

  it('should match #t as true', function (done) {
    pasreScheme('#trest')
    .then(function (res) {
      expect(res.matched[0] instanceof types.SchemeBool).toBe(true);
      expect(res.matched[0].val).toEqual(true);
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match #f as false', function (done) {
    pasreScheme('#frest')
    .then(function (res) {
      expect(res.matched[0] instanceof types.SchemeBool).toBe(true);
      expect(res.matched[0].val).toEqual(false);
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match integers', function (done) {
    pasreScheme('123rest')
    .then(function (res) {
      expect(res.matched[0] instanceof types.SchemeNum).toBe(true);
      expect(res.matched[0].val).toEqual(123);
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match decimals', function (done) {
    pasreScheme('123.456rest')
    .then(function (res) {
      expect(res.matched[0] instanceof types.SchemeNum).toBe(true);
      expect(res.matched[0].val).toEqual(123.456);
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match lists', function (done) {
    pasreScheme('(2.718 #t "hello" foo)rest')
    .then(function (res) {
      expect(res.matched[0] instanceof types.SchemeList).toBe(true);
      expect(res.matched[0].val[0] instanceof types.SchemeNum).toBe(true);
      expect(res.matched[0].val[1] instanceof types.SchemeBool).toBe(true);
      expect(res.matched[0].val[2] instanceof types.SchemeString).toBe(true);
      expect(res.matched[0].val[3] instanceof types.SchemeAtom).toBe(true);

      expect(res.matched[0].val[0].val).toEqual(2.718);
      expect(res.matched[0].val[1].val).toEqual(true);
      expect(res.matched[0].val[2].val).toEqual('hello');
      expect(res.matched[0].val[3].val).toEqual('foo');
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match nestesd list', function (done) {
    pasreScheme('(2.718 (#t "hello") foo)rest')
    .then(function (res) {
      expect(res.matched[0] instanceof types.SchemeList).toBe(true);
      expect(res.matched[0].val[0] instanceof types.SchemeNum).toBe(true);

      expect(res.matched[0].val[1] instanceof types.SchemeList).toBe(true);
      expect(res.matched[0].val[1].val[0] instanceof types.SchemeBool).toBe(true);
      expect(res.matched[0].val[1].val[1] instanceof types.SchemeString).toBe(true);

      expect(res.matched[0].val[2] instanceof types.SchemeAtom).toBe(true);

      expect(res.matched[0].val[0].val).toEqual(2.718);
      expect(res.matched[0].val[1].val[0].val).toEqual(true);
      expect(res.matched[0].val[1].val[1].val).toEqual('hello');
      expect(res.matched[0].val[2].val).toEqual('foo');
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
  it('should match empty list', function (done) {
    pasreScheme('()rest')
    .then(function (res) {
      expect(res.matched[0] instanceof types.SchemeList).toBe(true);
      expect(res.matched[0].val.length).toEqual(0);
      expect(res.remaining).toEqual('rest');
    })
    .catch(done.fail)
    .done(done);
  });
});
