var scheme = require('../scheme.js');

describe('scheme', function () {
  it('SchemeString should eval to itself', function () {
    var value = new scheme.SchemeString("foo");
    expect(value.eval()).toBe(value);
  });
  it('SchemeBool should eval to itself', function () {
    var value = new scheme.SchemeBool(true);
    expect(value.eval()).toBe(value);
  });
  it('SchemeNum should eval to itself', function () {
    var value = new scheme.SchemeNum(56.56);
    expect(value.eval()).toBe(value);
  });
  it('SchemeAtom should eval to what\'s in environemnt', function () {
    var atom = new scheme.SchemeAtom("foo"),
        thing = new scheme.SchemeNum(56.56);
    expect(atom.eval({foo: thing})).toBe(thing);
  });
  it('SchemeList with a (primative) function call should eval list items and apply function',
    function () {
      var list = new scheme.SchemeList([
        new scheme.SchemeAtom("foo"),
        new scheme.SchemeAtom("bar")
      ]);
      var fn = jasmine.createSpy();
      var env = {
        foo: new scheme.SchemePrimativeFunction(fn),
        bar: new scheme.SchemeNum(99)
      };
      list.eval(env);
      expect(fn).toHaveBeenCalledWith(new scheme.SchemeNum(99));
    }
  );
  it('SchemeList with a (user) function call should eval list items and apply function',
    function () {
      var list = new scheme.SchemeList([
        new scheme.SchemeAtom("foo"),
        new scheme.SchemeAtom("bar")
      ]);
      var fn = jasmine.createSpy();
      var env = {
        foo: new scheme.SchemeUserFunction({}, [new scheme.SchemeAtom("x")], [new scheme.SchemeAtom("x")]),
        bar: new scheme.SchemeNum(99)
      };
      expect(list.eval(env)).toEqual(new scheme.SchemeNum(99));
    }
  );
  it('define special form should work', function () {
    var list = new scheme.SchemeList([
      new scheme.SchemeAtom("define"),
      new scheme.SchemeAtom("foo"),
      new scheme.SchemeNum(99)
    ]);
    var env = {};
    list.eval(env);
    expect(env.foo).toEqual(new scheme.SchemeNum(99));
  });
  it('lambda special form should work', function () {
    var argsList = [
      new scheme.SchemeAtom("x"),
      new scheme.SchemeAtom("y"),
    ];
    var bodyList = [
      new scheme.SchemeAtom("a"),
      new scheme.SchemeAtom("b"),
    ];
    var list = new scheme.SchemeList([
      new scheme.SchemeAtom("lambda"),
      new scheme.SchemeList(argsList),
      bodyList[0],
      bodyList[1]
    ]);
    expect(list.eval({})).toEqual(new scheme.SchemeUserFunction({},argsList,bodyList));
  });
});
