{define} = require '../source/xtype'

describe 'Inherit', ->

  it 'should have delayed on-the-fly inheritance', ->

    define 'd', 'object', keys: {d: 'boolean'}
    define 'e', 'object', keys: {e: 'boolean'}
    define 'f', 'object', keys: {f: 'boolean'}

    define 'c', 'object',
      inherit: ['d', 'e', 'f']
      keys: {c: 'number'}
      switch: (obj) ->
        console.log 'testing obj', obj
        return obj.c

    define 'b', 'object',
      inherit: 'c'
      keys: {b: 'boolean'}

    test = define 'a', 'object',
      inherit: 'b'
      keys: {a: 'boolean'}

    console.log test({
      a: true
      b: true
      c: 0
      d: true
    })

    console.log test({
      a: true
      b: true
      c: 1
      e: true
    })
