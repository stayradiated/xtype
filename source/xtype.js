var Dictionary, define, defineFn, dict, fn;

Dictionary = require('./dictionary');
fn = require('./fn');

dict = new Dictionary();

/*
 * Test
 */

test = function (type, obj) {
  return dict.get(type).fn(obj);
};

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
  var def, key, keys, method, propType, proto, protoFn, protoFns, protoKeys, typeCheck, value, _ref;

  // Create a new definition in the dictionary
  def = dict.add({
    name: name,
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
    def.fn = fn.custom(typeCheck, options);
    return def.fn;
  }

  // Check each property of the object to match options.all
  if (options.all) {
    propType = dict.get(options.all).fn;
    def.fn = fn.single(typeCheck, propType);
    return def.fn;
  }

  // Make sure options.keys exists
  keys = options.keys = options.keys || {};

  // Replace key values with actual functions
  for (key in keys) {
    value = keys[key];
    keys[key] = dict.get(value).fn;
  }

  // Select a method to use
  method = options.other ? 'flexible' : 'strict';

  switch (typeof options.inherit) {

    // No inheritance
    case 'undefined':
      def.fn = fn[method](typeCheck, keys);
      return def.fn;

    // One-to-one inheritance
    case 'string':
      proto = dict.get(options.inherit);
      protoKeys = proto.options.keys;
      protoFn = proto.protoFn;

      // Set prototype
      keys.__proto__ = protoKeys;

      if (protoFn) {
        def.protoFn = protoFn;
        def.fn = fn.inherit[method](typeCheck, keys, protoFn);
      } else {
        def.fn = fn[method](typeCheck, keys);
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
            protoFns[key] = fn.setProtoChain(keys, protoKeys, protoFn);
          } else {
            protoFns[key] = fn.setProto(keys, protoKeys);
          }
        }
      }

      def.protoFn = fn.switchProto(keys, protoFns, options.check);
      def.fn = fn.inherit[method](typeCheck, keys, def.protoFn);

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
  var typeFn, args, type, types, i, len;

  if (arguments.length >= 2) {
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

  return fn.defineFn(args);
};

module.exports = {
  test: test,
  define: define,
  defineFn: defineFn,
  undefine: dict.remove
};

// Load default definitions
require('./defaults');
