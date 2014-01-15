# -----------------------------------------------------------------------------
# Function Generator
# -----------------------------------------------------------------------------

module.exports =

  ###
   * Custom
   *
   * Uses a custom function combined a single type check
   *
   * - type (function) : type checking function
   * - fn (function) : custom function to use
  ###

  custom: (type, fn) ->
    return (obj) ->
      return false unless type(obj)
      return fn(obj)


  ###
   * Single
   *
   * Checks that all properties of an object match a certain type
   *
   * - type (function) : to test object type
   * - propType (function) : to test object properties
  ###

  single: (type, propType) ->
    return (obj) ->
      return false unless type(obj)
      for own key, value of obj
        return false unless propType(value)
      return true


  ###
   * Strict
   *
   * Check that all properties in the object match against the keys.
   * Will return false if the object has a property not listed in keys.
   *
   * - type (function) : to test object type
   * - keys (object) : functions to check each property
  ###

  strict: (type, keys) ->
    return (obj) ->
      return false unless type(obj)
      for own key, value of obj
        fn = keys[key]
        return false unless fn
        return false unless fn(value)
      return true


  ###
   * Flexible
   *
   * Check that all properties in the object match against the keys.
   * Will ignore properties not listed in keys.
   *
   * - type (function) : to test object type
   * - keys (object) : functions to check each property
  ###

  flexible: (type, keys) ->
    return (obj) ->
      return false unless type(obj)
      for own key, value of obj
        fn = keys[key]
        if fn
          return false unless fn(value)
      return true


  ###
   * Set Prototype for Inheritance
   * Called by switchProto
   *
   * - keys (object) : keys to set prototype of
   * - proto (object) : object to set as the prototype
  ###

  setProto: (keys, proto) ->
    return (obj) ->
      keys.__proto__ = proto


  ###
   * Set Prototype for Inheritance AND continue the chain
   * Called by switchProto
   *
   * - keys (object) : keys to set prototype of
   * - proto (object) : possible objects to be the prototype
   * - chain (function) : runs after the prototype has been set
  ###

  setProtoChain: (keys, proto, chain) ->
    return (obj) ->
      keys.__proto__ = proto
      chain(obj)


  ###
   * Switch prototypes for a definition using a custom function
   *
   * - protoFns (object) : possible prototypes to use
   * - check (function) : to decide which prototype to use
  ###

  switchProto: (protoFns, check) ->
    return (obj) ->
      index = check(obj)
      return false if index is false
      return false unless protoFns.hasOwnProperty(index)
      protoFns[index](obj)


  ###
   * Inherit
   *
   * These functions run an seperate function called `inheritFn` that sets up
   * the keys prototype value
  ###

  inherit:


    ###
     * Strict + Custom Inherit
     *
     * - type (function)
     * - keys (object)
     * - protoFn (array)
    ###

    strict: (type, keys, protoFn) ->
      return (obj) ->
        return false unless type(obj)

        protoFn(obj)

        for own key, value of obj
          fn = keys[key]
          return false unless fn
          return false unless fn(value)

        return true


    ###
     * Flexible + Custom Inherit
     *
     * - type (function)
     * - keys (object)
     * - protoFn (array)
    ###

    flexible: (type, keys, protoFn) ->
      return (obj) ->
        return false unless type(obj)

        protoFn(obj)

        for own key, value of obj
          fn = keys[key]
          if fn
            return false unless fn(value)

        return true
