Dictionary = require './dictionary'
fn = require './fn'

dict = new Dictionary()

# Recursively inherit defintions
mergeKeys = (a, b) ->

  details = keys: {}

  if a.keys
    details.keys[k] = v for k, v of a.keys

  if b.keys
    details.keys[k] = v for k, v of b.keys when not a.keys[k]?

  if b.inherit
    details.keys = mergeKeys details, dict.get(b.inherit).details

  return details.keys



# Create a new type definition
define = (name, type, details) ->

  # Create definition
  def = dict.add
    name: name
    type: type
    details: details

  # Raw def
  if typeof type is 'function'
    return def.fn = type

  # Get function to check type of object
  typeCheck = dict.get(type).fn

  # Rename definition
  if not details
    return def.fn = typeCheck

  # Type check + custom function
  if typeof details is 'function'
    return def.fn = fn.check(typeCheck, details)



  # Check all object properties are of a certain type
  all = null
  if details.all
    all = dict.get(details.all).fn


  # Checking object/array keys
  if details.keys
    for key, value of details.keys
      details.keys[key] = dict.get(value).fn

  keys = details.keys

  # Inheriting properties from other definitions
  inherit = null
  if typeof details.inherit is 'function'
    inherit = (obj) ->
      type = details.inherit(obj)
      keys = mergeKeys def.details, dict.get(type).details

      for own key, value of obj
        if keys[key]
          return false unless keys[key](value)
        else if not details.other
          return false

      return true

  else if typeof details.inherit is 'string'
    keys = mergeKeys def.details, dict.get(details.inherit).details

  # Creating definition
  return def.fn = (obj) ->
    return false unless typeCheck obj

    if inherit then return false unless inherit(obj)

    for own key, value of obj

      if all
        return false unless all(value)
      else if keys
        if keys[key]
          return false unless keys[key](value)
        else if not details.other
          return false

    return true




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
