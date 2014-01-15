should = require 'should'
{define, defineFn, undefine} = require '../source/xtype'

describe '[xType]', ->

  definitions = []
  functions = []

  _define = define
  _defineFn = defineFn

  define = (name, type, details) ->
    definitions.push name
    return _define(name, type, details)

  defineFn = (name, args...) ->
    functions.push name
    return _defineFn(name, args...)

  describe '[define]', ->

    afterEach ->
      undefine name for name in definitions
      definitions = []

    it 'should define a native type', ->

      test = define 'native_type', 'number'

      test(38).should.equal true
      test(-1).should.equal true

      test('').should.equal false
      test({}).should.equal false
      test([]).should.equal false


    it 'should not allow definitions to reuse the same name', ->

      define 'name_a', 'string'
      ( -> define 'name_a', 'number' ).should.fail


    it 'should be able to rename types', ->

      define 'int', 'number'

      test = define 'test', 'int'

      test(20).should.equal true
      test('string').should.equal false


    it 'should know the difference between an object and an array', ->

      test = define 'array_test', 'array'

      test([]).should.equal true
      test({}).should.equal false

      test = define 'object_test', 'object'

      test({}).should.equal true
      test([]).should.equal false

      test = define 'native_object', '*object'

      test({}).should.equal true
      test([]).should.equal true


    it 'should define a basic object', ->

      test = define 'basic_object', 'object',
        keys:
          id: 'number'
          name: 'string'

      # Full match
      test({
        id: 20
        name: 'A string'
      }).should.equal true

      # Partial properties
      test({ id: 10 }).should.equal true
      test({ name: 'word' }).should.equal true

      # Objects vs arrays
      test([]).should.equal false
      test({}).should.equal true

      # Extra properties should mark it as invalid
      test({
        id: 30
        name: 'test'
        other: 'prop'
      }).should.equal false


    it 'should allow excess keys', ->

      test = define 'other_object', 'object',
        keys:
          id: 'number'
          name: 'string'
        other: true

      test({
        id: 20
        name: 'name'
      }).should.equal true

      test({
        id: 20
        name: 'name'
        random: true
      }).should.equal true

      test({
        notevenclose: 'amazing'
      }).should.equal true

    it 'should inherit properties from other definitions', ->

      define 'model', 'object',
        keys:
          id: 'number'
          name: 'string'

      define 'box', 'object',
        inherit: 'model'
        keys:
          width: 'number'
          height: 'number'

      test = define 'special_box', 'object',
        inherit: 'box'
        keys:
          color: 'string'

      test({
        id: 20
        name: 'Box'
        width: 20
        height: 30
        color: 'red'
      }).should.equal true


    it 'should override inherited properties', ->

      define 'model_1', 'object',
        keys:
          id: 'number'
          name: 'string'

      define 'model_2', 'object',
        inherit: 'model_1'
        keys:
          id: 'string'
          list: 'string'

      test = define 'model_3', 'object',
        inherit: 'model_2'
        keys:
          list: 'number'

      test({
        id: 's20'
        name: 'test'
        list: 30
      }).should.equal true

      test({
        id: 20
        list: 'c20'
        name: ['fail']
      }).should.equal false


    it 'should test indexes of an array', ->

      test = define 'test_array', 'array',
        keys:
          0: 'string'
          1: 'number'

      test(['a string', 20]).should.equal true
      test([20, 'string']).should.equal false


    it 'should inherit with arrays', ->

      define 'array_1', 'array',
        keys:
          0: 'number'

      define 'array_2', 'array',
        inherit: 'array_1'
        keys:
          1: 'string'

      test = define 'array_3', 'array',
        inherit: 'array_2'
        keys:
          2: 'object'

      test([20, 'word', {}]).should.equal true


    it 'should be able to use custom child classes', ->

      define 'child', 'object',
        keys:
          id: 'number'
          name: 'string'

      test = define 'parent', 'object',
        keys:
          name: 'string'
          child: 'child'

      test({
        name: 'word'
      }).should.equal true

      test({
        name: 20
      }).should.equal false

      test({
        name: 'A name'
        child: {
          id: 20
          name: 'no'
        }
      }).should.equal true

      test({
        child: {
          name: 30
        }
      }).should.equal false

      test({
        child:
          random: false
      }).should.equal false

    it 'should use a custom function to check', ->

      test = define 'test_fn', 'number', (obj) -> 10 < obj < 20

      test(15).should.equal true
      test(10).should.equal false
      test(20).should.equal false

    it 'should check all properties of an object', ->

      test = define 'object_numbers', 'object',
        all: 'number'

      test({
        id: 30
        height: 20
        width: 10
      }).should.equal true

      test({
        id: 30
        height: 20
        width: 10
        name: 'string'
      }).should.equal false

    it 'should check all properties of an array', ->

      test = define 'array_strings', 'array',
        all: 'string'

      test(['a', 'short', 'story']).should.equal true
      test([10, 'short', 'stories']).should.equal false

    it 'should have on-the-fly inheritance', ->

      define 'thing_1', 'array',
        keys:
          1: 'string'

      define 'thing_2', 'array',
        keys:
          1: 'array'

      define 'thing_3', 'array',
        keys:
          1: 'object'

      test = define 'model', 'array',
        keys:
          0: 'number'
        inherit: ['thing_1', 'thing_2', 'thing_3']
        switch: (obj) ->
          num = obj[0]
          return false unless 0 <= num <= 2
          return num

      test([0, 'word']).should.equal true
      test([0, []]).should.equal false
      test([0, {}]).should.equal false

      test([1, 'word']).should.equal false
      test([1, []]).should.equal true
      test([1, {}]).should.equal false

      test([2, 'word']).should.equal false
      test([2, []]).should.equal false
      test([2, {}]).should.equal true

    it 'should have delayed on-the-fly inheritance', ->

      define 'd', 'object', keys: {d: 'boolean'}
      define 'e', 'object', keys: {e: 'boolean'}
      define 'f', 'object', keys: {f: 'boolean'}

      define 'c', 'object',
        inherit: ['d', 'e', 'f']
        keys: {c: 'number'}
        switch: (obj) -> return obj.c

      define 'b', 'object',
        inherit: 'c'
        keys: {b: 'boolean'}

      test = define 'a', 'object',
        inherit: 'b'
        keys: {a: 'boolean'}

      test({
        a: true
        b: true
        c: 0
        d: true
      }).should.equal true

      test({
        a: true
        b: true
        c: 1
        e: true
      }).should.equal true

      test({
        a: true
        b: true
        c: 2
        f: true
      }).should.equal true

      test({
        a: true
        b: true
        c: 3
        g: true
      }).should.equal false

    it 'should have multiple inheritance functions', ->

      define 'j', 'object',
        keys: j: 'boolean'

      define 'i', 'object',
        keys: i: 'boolean'

      define 'h', 'object',
        keys: h: 'boolean'

      define 'g', 'object',
        keys: g: 'boolean'

      define 'f', 'object',
        keys: f: 'number'
        inherit: ['i', 'j']
        switch: (obj) -> return obj.f

      define 'e', 'object',
        keys: e: 'boolean'

      define 'd', 'object',
        keys: d: 'number'
        inherit: ['g', 'h']
        switch: (obj) -> return obj.d

      define 'c', 'object',
        keys: c: 'number'
        inherit: ['d', 'e', 'f']
        switch: (obj) -> return obj.c

      define 'b', 'object',
        inherit: 'c',
        keys: b: 'boolean'

      test = define 'a', 'object',
        inherit: 'b',
        keys: a: 'boolean'

      test({
        a: true
        b: true
        c: 0
        d: 0
        g: true
      }).should.equal true

      test({
        a: true
        b: true
        c: 0
        d: 1
        h: true
      }).should.equal true

      test({
        a: true
        b: true
        c: 1
        e: true
      }).should.equal true

      test({
        a: true
        b: true
        c: 2
        f: 0
        i: true
      }).should.equal true

      test({
        a: true
        b: true
        c: 2
        f: 1
        j: true
      }).should.equal true

      test({
        a: true
        b: true
        c: 1
        f: 1
        j: true
      }).should.equal false

      test({
        a: true
        b: true
        c: 0
        d: 1
        j: true
      }).should.equal false

  describe '[defineFn]', ->

    afterEach ->
      # undefineFn name for name in functions
      functions = []

    it 'should define functions with multiple argument types', ->

      fn = defineFn 'fn', 'number', 'string', 'object'

      fn(20, 'word', {}).should.equal true
      fn(10, 'adjective', new Object()).should.equal true
      fn(30, 'verb', {}, []).should.equal true

      fn().should.equal false
      fn('nah').should.equal false
      fn(5, 'noun').should.equal false

    it 'should have optional arguments', ->

      fn = defineFn 'fn', 'string', '~function'

      fn('verb', ->).should.equal true
      fn('verb').should.equal true

      fn('verb', 20).should.equal false
