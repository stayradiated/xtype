{define} = require './xtype'

# -----------------------------------------------------------------------------
# Useful Definitions
# -----------------------------------------------------------------------------

ARRAY  = '[object Array]'
OBJECT = '[object Object]'

define 'array',    (obj) -> Object::toString.call(obj) is ARRAY
define 'object',   (obj) -> Object::toString.call(obj) is OBJECT

define 'string',   (obj) -> typeof obj is 'string'
define 'number',   (obj) -> typeof obj is 'number'
define 'boolean',  (obj) -> typeof obj is 'boolean'
define 'function', (obj) -> typeof obj is 'function'
define '*object',  (obj) -> typeof obj is 'object'
