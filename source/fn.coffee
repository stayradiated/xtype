# -----------------------------------------------------------------------------
# Function Generator
# -----------------------------------------------------------------------------

module.exports =

  check: (check, fn) ->
    return (obj) ->
      return false unless check(obj)
      return fn(obj)

