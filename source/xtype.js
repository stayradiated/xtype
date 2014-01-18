var Dictionary, define, functions, defineFn, dict, func, get, getFn;

Dictionary = require('./dictionary');

if (global.DEBUG) {
  // Will print messages when a validation check fails
  func = require('./fn_debug');
} else {
  func = require('./fn');
}

dict = new Dictionary();
functions = new Dictionary();

/*
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
*/


define = function (name, type, options) {
  var def, key, keys, method, propType, proto, protoFn, protoFns, protoKeys, typeCheck, value, req, _ref;

  // Create a new definition in the dictionary
  def = dict.add(name, {
    type: type,
    options: options
  });

  // Raw definition
  if (typeof type === 'function') {
    def.fn = type;
    return def.fn;
  }

  // Get the function to check that an object is of the correct type
  typeCheck = dict.get(type).fn;

  // If options aren't specified, just use the type check fn
  if (! options) {
    def.fn = typeCheck;
    return def.fn;
  }

  // If options is a function, use that to check the object
  if (typeof options === 'function') {
    def.fn = func.custom(typeCheck, options);
    return def.fn;
  }

  // Check if required has been defined
  req = def.required = options.required ? options.required : [];

  // Check each property of the object to match options.all
  if (options.all) {
    propType = dict.get(options.all).fn;
    method = req.length ? 'single_req' : 'single';
    def.fn = func[method](typeCheck, propType, req);
    return def.fn;
  }

  // Make sure options.keys exists
  keys = options.keys = options.keys || {};

  // Replace key values with actual functions
  for (key in keys) {
    value = keys[key];

    // Required properties are prefixed with an asterisk
    if (value[0] === '*') {
      value = value.slice(1);
      req.push(key);
    }

    keys[key] = dict.get(value).fn;
  }

  // Select a method to use
  method = options.other ? 'flexible' : 'basic';

  switch (typeof options.inherit) {

    // No inheritance
    case 'undefined':
      if (req.length) { method += '_req'; }
      def.fn = func[method](typeCheck, keys, req);
      return def.fn;

    // One-to-one inheritance
    case 'string':
      proto = dict.get(options.inherit);
      protoKeys = proto.options.keys;
      protoFn = proto.protoFn;

      // Set prototype
      keys.__proto__ = protoKeys;

      // Merge required keys
      req = def.required = req.concat(proto.required);
      if (req.length) { method += '_req'; }

      if (protoFn) {
        def.protoFn = protoFn;
        def.fn = func.inherit[method](typeCheck, keys, protoFn, req);
      } else {
        def.fn = func[method](typeCheck, keys, req);
      }

      return def.fn;

    // One-to-many inheritance
    case 'object':

      if (! options.check) {
        throw new Error('Must specify check fn if inherit is an object: ' + name);
      }

      protoFns = {};

      for (key in options.inherit) {
        if (options.inherit.hasOwnProperty(key)) {
          value = options.inherit[key];

          proto = dict.get(value);
          protoKeys = proto.options.keys;
          protoFn = proto.protoFn;

          if (protoFn) {
            protoFns[key] = func.setProtoChain(keys, protoKeys, protoFn);
          } else {
            protoFns[key] = func.setProto(keys, protoKeys);
          }
        }
      }

      def.protoFn = func.switchProto(keys, protoFns, options.check);
      def.fn = func.inherit[method](typeCheck, keys, def.protoFn, req);

      return def.fn;
  }

  throw new Error('Could not read options: ' + name);
};

/*
 * Define Function
 *
 * - name (string)
 * - types... (string)
*/


defineFn = function (name) {
  var def, typeFn, args, type, types, i, len;

  def = functions.add(name, {});

  if (arguments.length >= 2)  {
    types = Array.prototype.slice.call(arguments, 1);
  } else {
    types = [];
  }

  args = [];

  for (i = 0, len = types.length; i < len; i += 1) {
    type = types[i];

    if (type[0] === '~') {
      typeFn = dict.get(type.slice(1)).fn;
      typeFn.optional = true;
    } else {
      typeFn = dict.get(type).fn;
    }

    args.push(typeFn);
  }

  def.fn = func.defineFn(args);
  return def.fn;
};


/*
 * Get
 *
 * - type (string)
 */

get = function (type) {
  return dict.get(type).fn;
};


/*
 * GetFn
 *
 * - name (string)
 */

getFn = function (name) {
  return functions.get(name).fn;
};


/*
 * Guard
 */

guard = function (name, callback, context) {
  var def = getFn(name);
  return func.guard(def, callback, context || this)
};

module.exports = {
  get: get,
  getFn: getFn,
  guard: guard,
  define: define,
  defineFn: defineFn,
  undefine: dict.remove
};

// Load default definitions
require('./defaults');
