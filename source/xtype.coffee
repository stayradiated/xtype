# Hold all the definitions
definitions = {}

# Remove a definition
undefine = (name) ->
  delete definitions[name]

# Recursively inherit defintions
mergeKeys = (a, b) ->

  details = keys: {}

  if a.keys
    details.keys[k] = v for k, v of a.keys

  if b.keys
    details.keys[k] = v for k, v of b.keys when not a.keys[k]?

  if b.inherit
    details.keys = mergeKeys details, definitions[b.inherit].details

  return details.keys

getDef = (name) ->
  def = definitions[name]
  if not def then throw new Error('Could not find definition: ' + name)
  return def

# Get a definition
getDefFn = (name) ->
  def = definitions[name]
  if not def then return checkType(name)
  return def.fn

# Check an object is of a native type
check = (obj, type) ->
  return typeof obj is type

# Curried version of `check`
checkType = (type) ->
  return (obj) -> return typeof obj is type

# Create a new type definition
define = (name, type, details) ->

  if definitions[name]
    throw new Error('Definition already defined: ' + name)

  # Create definition
  def = definitions[name] =
    name: name
    type: type
    details: details

  # Get function to check type of object
  typeCheck = getDefFn(type)

  # Simplest definition
  if not details
    return def.fn = getDefFn(type)

  # Checking function
  if check details, 'function'
    return def.fn = (obj) ->
      return false unless typeCheck(obj)
      return details(obj)

  # Check all object properties are of a certain type
  all = details.all
  if all then all = getDefFn(all)

  # Checking object/array keys
  if details.keys
    for key, value of details.keys
      details.keys[key] = getDefFn(value)

  keys = details.keys

  # Inheriting properties from other definitions
  inherit = null
  if typeof details.inherit is 'function'
    inherit = (obj) ->
      type = details.inherit(obj)
      keys = mergeKeys def.details, getDef(type).details

      for own key, value of obj
        if keys[key]
          return false unless keys[key](value)
        else if not details.other
          return false

      return true

  else if typeof details.inherit is 'string'
    keys = mergeKeys def.details, getDef(details.inherit).details

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
      fn = getDefFn(type[1..])
      fn.optional = true
    else
      fn = getDefFn(type)
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
  undefine: undefine
