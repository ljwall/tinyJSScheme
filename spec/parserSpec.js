var Parser = require('../lib/parser.js');


describe('Parser', function () {

  describe('matchStr', function () {
    it('should match a string', function (done) {
      var m = Parser.matchStr('Foo');

      m.parse('FooBar!').then(function (res) {
        expect(res.matched).toEqual(['Foo']);
        expect(res.remaining).toEqual('Bar!');
      })
      .catch(done.fail)
      .done(done);

    });

    it('should fail if no match', function (done) {
      var m = Parser.matchStr('Foo');

      m.parse('BarFoo!')
      .then(done.fail.bind(null, "Should not resolve"))
      .catch(function (err) {
        expect(err.expecting).toEqual([{
          val: 'Foo',
          context: 'BarFoo!'
        }]);
        done();
      });

    });
  });

  describe('followedBy', function () {
    it('should match a sequsence', function (done) {
      var m = Parser.matchStr('Foo')
              .followedBy(Parser.matchStr('Bar'))
              .followedBy(Parser.matchStr('Baz'))
              .followedBy(Parser.matchStr('Spam'))
              .followedBy(Parser.matchStr('Eggs'))
              .followedBy(Parser.matchStr('Ham'));

      m.parse('FooBarBazSpamEggsHam!!').then(function (res) {
        expect(res.matched).toEqual(['Foo', 'Bar', 'Baz', 'Spam', 'Eggs', 'Ham']);
        expect(res.remaining).toEqual('!!');
      })
      .catch(done.fail)
      .done(done);

    });

    it('should fail not a match', function (done) {
      var m = Parser.matchStr('Foo')
              .followedBy(Parser.matchStr('Bar'))
              .followedBy(Parser.matchStr('Baz'));

      m.parse('FooBarSpam')
      .then(done.fail.bind(null, "Should not resolve"))
      .catch(function (err) {
        expect(err.expecting).toEqual([{
          val: 'Baz',
          context: 'Spam'
        }]);
        done();
      });

    });
  });

  describe('or', function () {
    it('should match', function (done) {
      var m = Parser.matchStr('Foo')
              .or(Parser.matchStr('Bar').or(Parser.matchStr('Spam')))
              .or(Parser.matchStr('Baz'));

      m.parse('BarSpamHam').then(function (res) {
        expect(res.matched).toEqual(['Bar']);
        expect(res.remaining).toEqual('SpamHam');
      })
      .catch(done.fail)
      .done(done);
    });

    it('should fail if no match', function (done) {
      var m = Parser.matchStr('Foo')
              .or(Parser.matchStr('Bar'));

      m.parse('BazSpamHam')
      .then(done.fail.bind(null, "Should not resolve"))
      .catch(function (err) {
        expect(err.expecting).toEqual([{
          val: 'Foo',
          context: 'BazSpamHam'
        }, {
          val: 'Bar',
          context: 'BazSpamHam'
        }]);
        done();
      });
    });
  });

  describe('andReturn', function () {
    it('should alter the returned match', function (done) {
      var m = Parser.matchStr('Foo')
              .andReturn(99);

      m.parse('FooBar').then(function (res) {
        expect(res.matched).toEqual([99]);
        expect(res.remaining).toEqual('Bar');
      })
      .catch(done.fail)
      .done(done);
    });
  });

  describe('map', function () {
    it('should alter the returned match', function (done) {
      var m = Parser.matchStr('99')
              .map(parseInt);

      m.parse('99Bar').then(function (res) {
        expect(res.matched).toEqual([99]);
        expect(res.remaining).toEqual('Bar');
      })
      .catch(done.fail)
      .done(done);
    });
  });

  describe('many', function () {
    it('should match many', function (done) {
      var m = Parser.many(Parser.matchStr('Foo'));

       m.parse('FooFooFooFooBar').then(function (res) {
        expect(res.matched).toEqual(['Foo', 'Foo', 'Foo', 'Foo']);
        expect(res.remaining).toEqual('Bar');
      })
      .catch(done.fail)
      .done(done);
    });
    it('should not fail if no match', function (done) {
      var m = Parser.many(Parser.matchStr('Bar'));

      m.parse('FooBar').then(function (res) {
        expect(res.matched).toEqual([]);
        expect(res.remaining).toEqual('FooBar');
      })
      .catch(done.fail)
      .done(done);
    });
  });
  describe('alphaChar', function () {
    it('should match alpha chars', function (done) {
      /* cheating - use many */
      var m = Parser.many(Parser.alphaChar);

      m.parse('alzALZ{').then(function (res) {
        expect(res.matched).toEqual(['a', 'l', 'z', 'A', 'L', 'Z']);
        expect(res.remaining).toEqual('{');
      })
      .catch(done.fail)
      .done(done);
    });
  });
  describe('numericChar', function () {
    it('should match numeric chars', function (done) {
      /* cheating - use many */
      var m = Parser.many(Parser.numericChar);

      m.parse('0123456789@').then(function (res) {
        expect(res.matched).toEqual(['0', '1', '2', '3', '4',
                                     '5', '6', '7', '8', '9']);
        expect(res.remaining).toEqual('@');
      })
      .catch(done.fail)
      .done(done);
    });
  });
  describe('maybe', function () {
    it('matches', function (done) {
      var m = Parser.maybe(Parser.matchStr('Foo'));

      m.parse('FooBar').then(function (res) {
        expect(res.matched).toEqual(['Foo']);
        expect(res.remaining).toEqual('Bar');
      })
      .catch(done.fail)
      .done(done);
    });
    it('doesn\' fail if no matches', function (done) {
      var m = Parser.maybe(Parser.matchStr('Foo'));

      m.parse('BarFoo').then(function (res) {
        expect(res.matched).toEqual([]);
        expect(res.remaining).toEqual('BarFoo');
      })
      .catch(done.fail)
      .done(done);
    });
  });
  describe('squash', function () {
    it('matches and squashed', function (done) {
      var m = Parser.matchStr('Foo').squash();

      m.parse('FooBar').then(function (res) {
        expect(res.matched).toEqual([]);
        expect(res.remaining).toEqual('Bar');
      })
      .catch(done.fail)
      .done(done);
    });
  });
  describe('sepBy', function () {
    it('should match', function (done) {
      var m = Parser.sepBy(Parser.matchStr('-'),
                           Parser.matchStr('Foo').or(Parser.matchStr('Bar')));

      m.parse('Bar-Foo-Foo-Bar-Wrong')
      .then(function (res) {
        expect(res.matched).toEqual(['Bar', 'Foo', 'Foo', 'Bar']);
        expect(res.remaining).toEqual('-Wrong');
      })
      .catch(done.fail)
      .done(done);
    });
  });

  describe('oneOfChars', function () {
    it('should match', function () {
      pending();
    });
  });
  describe('noneOfChars', function () {
    it('should match', function () {
      pending();
    });
    it('should fail on empty string', function (done) {
      Parser.noneOfChars('abc')
      .parse('')
      .then(done.fail.bind(null, "Should not resolve"))
      .catch(function (err) {
        done();
      });
    });
  });
  describe('reduce', function () {
    it('should work', function () {
      pending();
    });
  });

  describe('complex failures', function () {
    it('should work with mixture of folledBy and or', function (done) {
      Parser.matchStr('Foo')
      .followedBy(
        Parser.matchStr('Bar').followedBy(Parser.matchStr('Baz'))
        .or(Parser.matchStr('Spam'))
      )

      .parse('FooBarSpam')
      .then(done.fail.bind(null, "Should not resolve"))
      .catch(function (err) {
        expect(err.expecting).toEqual([
          {
            val: 'Baz',
            context: 'Spam'
          }
        ]);
        done();
      });
    })
  });
});
