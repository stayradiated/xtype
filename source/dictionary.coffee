class Dictionary

  constructor: ->
    @definitions = {}

  get: (name) ->
    def = @definitions[name]
    if not def
      throw new Error('Could not find definition: ' + name)
    return def

  add: (obj) ->
    name = obj.name
    if @definitions[name]
      throw new Error('Definition already defined: ' + name)
    @definitions[name] = obj

  remove: (name) ->
    delete @definitions[name]

module.exports = Dictionary
