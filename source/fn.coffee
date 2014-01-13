# -----------------------------------------------------------------------------
# Function Generator
# -----------------------------------------------------------------------------

module.exports =

  ###
   * Custom
   *
   * Uses a custom function with a basic typecheck
   *
   * - type (definition) : object type
   * - fn (function) : custom function to use
  ###

  custom: (type, fn) ->
    return (obj) ->
      return false unless type(obj)
      return fn(obj)


  ###
   * Single
   *
   * Checks all properties of the object have the same type
   *
   * - type (definition) : object type
   * - propType (definitions) : property type
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
   * - type (definitions) : object type
   * - keys (object) : keys to check against
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
   * - type (definitions) : object type
   * - keys (object) : keys to check against
  ###

  flexible: (type, keys) ->
    return (obj) ->
      return false unless type(obj)
      for own key, value of obj
        fn = keys[key]
        if fn
          return false unless fn(value)
      return true



  inherit:


    ###
     * Strict + Custom Inherit
     *
     * - type (string)
     * - inherit (array)
     * - check (function)
    ###

    strict: (type, inherit, check) ->
      return (obj) ->
        return false unless type(obj)

        index = check(obj)
        return false if index is false

        keys = inherit[index]

        for own key, value of obj
          fn = keys[key]
          return false unless fn
          return false unless fn(value)
        return true


    ###
     * Flexible + Custom Inherit
     *
     * - type (string)
     * - inherit (array)
     * - check (function)
    ###

    flexible: (type, inherit, check) ->
      return (obj) ->
        return false unless type(obj)

        index = check(obj)
        return false if index is false

        keys = inherit[index]

        for own key, value of obj
          fn = keys[key]
          if fn
            return false unless fn(value)

        return true

