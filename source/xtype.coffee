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
    return def.fn = fn.single typeCheck, dict.get(options.all).fn


  # -----

  keys = options.keys

  # You must have keys if you want to come this far
  # TODO: Figure out a better way to handle this
  if not keys
    throw new Error 'Keys are not specified for: ' + name

  # Checking object/array keys
  for key, value of keys
    keys[key] = dict.get(value).fn

  # -----


  # Inheriting properties from other definitions
  typeofInherit = typeof options.inherit

  switch typeofInherit

    when 'undefined'
      if options.other
        return def.fn = fn.flexible typeCheck, keys
      else
        return def.fn = fn.strict typeCheck, keys

    when 'string'
      inheriting = dict.get options.inherit

      if inheriting.options.keys
        keys.__proto__ = inheriting.options.keys

      log(keys)

      if inheriting.inheritFn
        def.inheritFn = inheriting.inheritFn

        return def.fn = fn.special typeCheck, keys, def.inheritFn

      else

        if options.other
          return def.fn = fn.flexible typeCheck, keys
        else
          return def.fn = fn.strict typeCheck, keys

    when 'object'
      inherit = {}
      for own key, value of options.inherit
        inherit[key] = dict.get(value)
      check = options.switch

  console.log 'check', typeof check

  # Create a function that will test the obj against check
  # and then get the result from the inherit object
  def.inheritFn = fn.inheritFn(keys, inherit, check)

  # Creating definition
  if options.other
    return def.fn = fn.inherit.flexible(typeCheck, keys, def.inheritFn)
  else
    return def.fn = fn.inherit.strict(typeCheck, keys, def.inheritFn)


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
