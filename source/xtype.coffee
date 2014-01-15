Dictionary = require './dictionary'
fn = require './fn'

dict = new Dictionary()

global.log = (obj) ->
  console.log '\n{'
  for key, value of obj
    console.log "  #{ key }: #{ typeof value }"
  console.log '}\n'

###
 * Define
 *
 * Create a new type definition
 *
 * - name (string)
 * - type (string)
 * - options (object)
 *
 * - type (function)
 * - options (function)
###

define = (name, type, options) ->

  # Create definition
  def = dict.add
    name: name
    type: type
    options: options

  # Raw def
  if typeof type is 'function'
    return def.fn = type

  # Get function to check type of object
  typeCheck = dict.get(type).fn

  # Rename definition
  if not options
    return def.fn = typeCheck

  # Type check + custom function
  if typeof options is 'function'
    return def.fn = fn.custom typeCheck, options

  # Check all object properties are of a certain type
  if options.all
    propType = dict.get(options.all).fn
    return def.fn = fn.single(typeCheck, propType)

  # -----

  keys = options.keys ?= {}

  # Replace key values with actual functions
  for key, value of keys
    keys[key] = dict.get(value).fn

  # -----

  # Select a method to use
  method = if options.other then 'flexible' else 'strict'

  # -----

  # Inheriting properties from other definitions
  switch typeof options.inherit

    when 'undefined'
      return def.fn = fn[method](typeCheck, keys)

    # -----

    when 'string'
      proto = dict.get(options.inherit)
      protoKeys = proto.options.keys
      protoFn = proto.protoFn

      keys.__proto__ = protoKeys

      if protoFn
        def.protoFn = protoFn
        return def.fn = fn.inherit[method](typeCheck, keys, protoFn)
      else
        return def.fn = fn[method](typeCheck, keys)

    # -----

    when 'object'

      unless options.switch
        throw new Error('Must specify switch fn if inherit is an object: ' + name)

      protoFns = {}

      for own key, value of options.inherit

        proto = dict.get(value)
        protoKeys = proto.options.keys
        protoFn = proto.protoFn

        if protoFn
          protoFns[key] = fn.setProtoChain(keys, protoKeys, protoFn)
        else
          protoFns[key] = fn.setProto(keys, protoKeys)

      # Create a function that will test the input against options.switch
      # and then execute the result from the protoFns object
      def.protoFn = fn.switchProto(protoFns, options.switch)

      # Creating definition
      return def.fn = fn.inherit[method](typeCheck, keys, def.protoFn)

  throw new Error('Could not read options')


###
 * Define Function
 *
 * - name (string)
 * - types... (string)
###

defineFn = (name, types...) ->

  args = []
  for type in types
    if type[0] is '~'
      fn = dict.get(type[1..]).fn
      fn.optional = true
    else
      fn = dict.get(type).fn
    args.push fn

  return (input...) ->
    for arg, i in args
      continue if input[i] is undefined and arg.optional
      return false unless arg input[i]
    return true


# -----------------------------------------------------------------------------
# Exports
# -----------------------------------------------------------------------------

module.exports =
  define: define
  defineFn: defineFn
  undefine: dict.remove


# -----------------------------------------------------------------------------
# Load Defaults
# -----------------------------------------------------------------------------

require './defaults'
