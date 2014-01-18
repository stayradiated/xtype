/*global describe, afterEach, it*/

var should, xType, defineFn;

should = require('should');
xType = require('../source/xtype');
defineFn = xType.defineFn;

describe('[xType]', function() {

  var definitions, define;

  definitions = [];

  define = function(name, type, details) {
    definitions.push(name);
    return xType.define(name, type, details);
  };

  afterEach(function() {
    var i, len;
    for (i = 0, len = definitions.length; i < len; i += 1) {
      xType.undefine(definitions[i]);
    }
    definitions = [];
  });

  describe('[define]', function() {

    it('should run definitions', function () {
      define('simple', 'number');
      xType.get('simple')(30).should.equal(true);
      xType.get('simple')('word').should.equal(false);
    });


    it('should use a pre-defined type', function() {
      var test;

      test = define('native_type', 'number');

      test(38).should.equal(true);
      test(-1).should.equal(true);
      test('').should.equal(false);
      test({}).should.equal(false);
      test([]).should.equal(false);
    });


    it('should have required keys', function () {
      var test;

      test = define('required', 'object', {
        keys: {
          id: '*number',
          str: 'string'
        }
      });

      test({id: 30, str: 'word'}).should.equal(true);
      test({id: 30}).should.equal(true);
      test({id: 0}).should.equal(true);

      test({id: 'string'}).should.equal(false);
      test({str: 'word'}).should.equal(false);
      test({}).should.equal(false);
    });


    it('should not allow definitions to reuse the same name', function() {
      var fn;

      define('name_a', 'string');

      fn = function () {
        define('name_a', 'number');
      };

      return fn.should.fail;
    });


    it('should be able to rename types', function() {
      var test;

      define('int', 'number');

      test = define('test', 'int');

      test(20).should.equal(true);
      test('string').should.equal(false);
    });


    it('should know the difference between an object and an array', function() {
      var test;

      test = define('array_test', 'array');

      test([]).should.equal(true);
      test({}).should.equal(false);

      test = define('object_test', 'object');

      test({}).should.equal(true);
      test([]).should.equal(false);

      test = define('native_object', '_object');

      test({}).should.equal(true);
      test([]).should.equal(true);
    });


    it('should create a strict definition', function() {
      var test;

      test = define('basic_object', 'object', {
        keys: {
          id: 'number',
          name: 'string'
        }
      });

      test([]).should.equal(false);
      test({}).should.equal(true);

      test({ id: 10 }).should.equal(true);
      test({ name: 'word' }).should.equal(true);
      test({ id: 20, name: 'string' }).should.equal(true);

      test({ id: 30, name: 'test', other: 'prop' }).should.equal(false);
    });


    it('should create a flexible definition', function() {
      var test;

      test = define('other_object', 'object', {
        keys: {
          id: 'number',
          name: 'string'
        },
        other: true
      });

      test({ id: 20, name: 'name' }).should.equal(true);
      test({ id: 20, name: 'name', random: true }).should.equal(true);
      test({ notevenclose: 'amazing' }).should.equal(true);

      test({ id: 'string', name: 'name' }).should.equal(false);
      test({ id: 30, name: [] }).should.equal(false);
      test({ id: 30, name: [], prop: false  }).should.equal(false);
    });

    it('should combine flexibility and required properties', function () {
      var test;

      test = define('flex_required', 'object', {
        keys: {
          id: '*number'
        },
        other: true
      });

      test({id: 10}).should.equal(true);
      test({id: 30, random: true}).should.equal(true);
      test({random: true}).should.equal(false);
    });


    it('should inherit properties from other definitions', function() {
      var test;

      test = define('model', 'object', {
        keys: {
          id: 'number',
          name: 'string'
        }
      });

      test({
        id: 20,
        name: 'Box'
      }).should.equal(true);

      test({
        id: 20,
        name: 'Box',
        width: 20,
        height: 30
      }).should.equal(false);

      test = define('box', 'object', {
        inherit: 'model',
        keys: {
          width: 'number',
          height: 'number'
        }
      });

      test({
        id: 20,
        name: 'Box',
        width: 20,
        height: 30
      }).should.equal(true);

      test({
        id: 20,
        name: 'Box',
        width: 20,
        height: 30,
        color: 'red'
      }).should.equal(false);

      test = define('special_box', 'object', {
        inherit: 'box',
        keys: {
          color: 'string'
        }
      });

      test({
        id: 20,
        name: 'Box',
        width: 20,
        height: 30,
        color: 'red'
      }).should.equal(true);

      test({
        id: 20,
        name: 'Box',
        width: 20,
        height: 30,
        color: 'red',
        panda: 'green'
      }).should.equal(false);
    });


    it('should override inherited properties', function() {
      var test;

      define('model_1', 'object', {
        keys: {
          id: 'number',
          name: 'string'
        }
      });

      define('model_2', 'object', {
        inherit: 'model_1',
        keys: {
          id: 'string',
          list: 'string'
        }
      });

      test = define('model_3', 'object', {
        inherit: 'model_2',
        keys: {
          list: 'number'
        }
      });

      test({
        id: 's20',
        name: 'test',
        list: 30
      }).should.equal(true);

      test({
        id: 20,
        list: 'c20',
        name: ['fail']
      }).should.equal(false);
    });


    describe('[array]', function () {

      it('should treat keys as indexes', function() {
        var test;

        test = define('test_array', 'array', {
          keys: {
            0: 'string',
            1: 'number'
          }
        });

        test(['word']).should.equal(true);
        test(['a string', 20]).should.equal(true);

        test([20, 'string']).should.equal(false);
        test([null, 30]).should.equal(false);
      });

      it('should inherit with arrays', function() {
        var test;

        define('array_1', 'array', {
          keys: {
            0: 'number'
          }
        });

        define('array_2', 'array', {
          inherit: 'array_1',
          keys: {
            1: 'string'
          }
        });

        test = define('array_3', 'array', {
          inherit: 'array_2',
          keys: {
            2: 'object'
          }
        });

        test([10]).should.equal(true);
        test([10, 'word']).should.equal(true);
        test([20, 'word', {}]).should.equal(true);

        test([undefined]).should.equal(false);
      });

      it('should check all properties', function() {
        var test;

        test = define('array_strings', 'array', {
          all: 'string'
        });

        test(['a', 'short', 'story']).should.equal(true);
        test([10, 'short', 'stories']).should.equal(false);
      });

      it('should combine required props and all', function () {
        var test;

        test = define('array_strings_req', 'array', {
          all: 'string',
          required: [0, 1]
        });

        test(['a','b']).should.equal(true);
        test(['a', 'b', 'c']).should.equal(true);

        test(['a', 'b', 30]).should.equal(false);
        test(['a']).should.equal(false);
        test([]).should.equal(false);
      });

    });

    it('should be able to use custom child classes', function() {
      var test;

      define('child', 'object', {
        keys: {
          id: 'number',
          name: 'string'
        }
      });

      test = define('parent', 'object', {
        keys: {
          name: 'string',
          child: 'child'
        }
      });

      test({
        name: 'word'
      }).should.equal(true);

      test({
        name: 20
      }).should.equal(false);

      test({
        name: 'A name',
        child: {
          id: 20,
          name: 'no'
        }
      }).should.equal(true);

      test({
        child: {
          name: 30
        }
      }).should.equal(false);

      test({
        child: {
          random: false
        }
      }).should.equal(false);
    });


    it('should use a custom function to check', function() {
      var test;

      test = define('test_fn', 'number', function(obj) {
        return (10 < obj && obj < 20);
      });

      test(15).should.equal(true);

      test(10).should.equal(false);
      test(20).should.equal(false);
    });


    it('should check all properties of an object', function() {
      var test;

      test = define('object_numbers', 'object', {
        all: 'number'
      });

      test({
        id: 30,
        height: 20,
        width: 10
      }).should.equal(true);

      test({
        id: 30,
        height: 20,
        width: 10,
        name: 'string'
      }).should.equal(false);
    });

    it('should combine inheritance with required properties', function () {
      var test;

      define('req_a', 'object', {
        keys: {
          a: '*number'
        }
      });

      define('req_b', 'object', {
        inherit: 'req_a',
        keys: {
          b: '*string'
        }
      });

      test = define('c', 'object', {
        inherit: 'req_b',
        keys: {
          c: 'boolean'
        }
      });

      test({a: 30, b: 'str', c: true}).should.equal(true)
      test({a: 20, b: 'str'}).should.equal(true);

      test({c: false}).should.equal(false);
      test({}).should.equal(false);
    });

    it('should switch inheritance per object', function() {
      var test;

      define('thing_1', 'array', {
        keys: {
          1: 'string'
        }
      });

      define('thing_2', 'array', {
        keys: {
          1: 'array'
        }
      });

      define('thing_3', 'array', {
        keys: {
          1: 'object'
        }
      });

      test = define('model', 'array', {
        keys: {
          0: 'number'
        },
        inherit: ['thing_1', 'thing_2', 'thing_3'],
        check: function(obj) {
          return obj[0];
        }
      });

      test([0, 'word']).should.equal(true);
      test([0, []]).should.equal(false);
      test([0, {}]).should.equal(false);

      test([1, 'word']).should.equal(false);
      test([1, []]).should.equal(true);
      test([1, {}]).should.equal(false);

      test([2, 'word']).should.equal(false);
      test([2, []]).should.equal(false);
      test([2, {}]).should.equal(true);

      test([3, 'word']).should.equal(false);
      test([3, []]).should.equal(false);
      test([3, {}]).should.equal(false);
    });


    it('should be able to inherit a checking definition', function() {
      var test;

      define('d', 'object', {
        keys: {
          d: 'boolean'
        }
      });

      define('e', 'object', {
        keys: {
          e: 'boolean'
        }
      });

      define('f', 'object', {
        keys: {
          f: 'boolean'
        }
      });

      define('c', 'object', {
        inherit: ['d', 'e', 'f'],
        keys: {
          c: 'number'
        },
        check: function(obj) {
          return obj.c;
        }
      });

      define('b', 'object', {
        inherit: 'c',
        keys: {
          b: 'boolean'
        }
      });

      test = define('a', 'object', {
        inherit: 'b',
        keys: {
          a: 'boolean'
        }
      });

      test({
        a: true,
        b: true,
        c: 0,
        d: true
      }).should.equal(true);

      test({
        a: true,
        b: true,
        c: 1,
        e: true
      }).should.equal(true);

      test({
        a: true,
        b: true,
        c: 2,
        f: true
      }).should.equal(true);

      test({
        a: true,
        b: true,
        c: 3,
        f: true
      }).should.equal(false);

    });


    it('should have multiple inheritance functions', function() {
      var test;

      define('j', 'object', { keys: { j: 'boolean' } });
      define('i', 'object', { keys: { i: 'boolean' } });
      define('h', 'object', { keys: { h: 'boolean' } });
      define('g', 'object', { keys: { g: 'boolean' } });
      define('e', 'object', { keys: { e: 'boolean' } });

      define('f', 'object', {
        keys: { f: 'number' },
        inherit: ['i', 'j'],
        check: function(obj) { return obj.f; }
      });

      define('d', 'object', {
        keys: { d: 'number' },
        inherit: ['g', 'h'],
        check: function(obj) { return obj.d; }
      });

      define('c', 'object', {
        keys: { c: 'number' },
        inherit: ['d', 'e', 'f'],
        check: function(obj) { return obj.c; }
      });

      define('b', 'object', {
        inherit: 'c',
        keys: { b: 'boolean' }
      });
      test = define('a', 'object', {
        inherit: 'b',
        keys: { a: 'boolean' }
      });

      test({
        a: true,
        b: true,
        c: 0,
        d: 0,
        g: true
      }).should.equal(true);

      test({
        a: true,
        b: true,
        c: 0,
        d: 1,
        h: true
      }).should.equal(true);

      test({
        a: true,
        b: true,
        c: 1,
        e: true
      }).should.equal(true);

      test({
        a: true,
        b: true,
        c: 2,
        f: 0,
        i: true
      }).should.equal(true);

      test({
        a: true,
        b: true,
        c: 2,
        f: 1,
        j: true
      }).should.equal(true);

      test({
        a: true,
        b: true,
        c: 1,
        f: 1,
        j: true
      }).should.equal(false);

      test({
        a: true,
        b: true,
        c: 0,
        d: 1,
        j: true
      }).should.equal(false);
    });
  });


  return describe('[defineFn]', function() {

    it('should define functions with multiple argument types', function() {
      var fn, test;

      fn = defineFn('fn', 'number', 'string', 'object');
      test = function () {
        return fn(arguments);
      };

      test(20, 'word', {}).should.equal(true);
      test(10, 'adjective', Object.create(null)).should.equal(true);
      test(30, 'verb', {}, []).should.equal(true);

      test().should.equal(false);
      test('nah').should.equal(false);
      test(5, 'noun').should.equal(false);
    });

    it('should have optional arguments', function() {
      var fn, test;

      fn = defineFn('fn_optional', 'string', '~function');
      test = function () {
        return fn(arguments);
      };

      test('verb').should.equal(true);
      test('verb', function() { console.log(); }).should.equal(true);

      test('verb', 20).should.equal(false);
    });

    it('should guard functions', function () {

      define('task', 'object', {
        keys: {
          id: 'string',
          listId: 'string',
          date: 'number',
          name: 'string',
          notes: 'string',
          priority: 'number',
          completed: 'boolean'
        }
      });

      defineFn('task_create', 'task', '~function');

      var task_create = function (model, callback) {
        return true;
      };

      task_create = xType.guard('task_create', task_create);

      task_create({}, function () {}).should.equal(true);
      task_create({ id: 'c30', listId: 's30' }).should.equal(true);

      task_create(null).should.equal(false);
      task_create({}, null).should.equal(false);
      task_create({ date: 'string' }).should.equal(false);

    });

  });

});

