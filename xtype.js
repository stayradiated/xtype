// Generated by CoffeeScript 1.6.3
(function() {
  var ARRAY, OBJECT, check, checkType, define, defineFn, definitions, getDef, getDefFn, mergeKeys, undefine,
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  definitions = {};

  undefine = function(name) {
    return delete definitions[name];
  };

  mergeKeys = function(a, b) {
    var details, k, v, _ref, _ref1;
    details = {
      keys: {}
    };
    if (a.keys) {
      _ref = a.keys;
      for (k in _ref) {
        v = _ref[k];
        details.keys[k] = v;
      }
    }
    if (b.keys) {
      _ref1 = b.keys;
      for (k in _ref1) {
        v = _ref1[k];
        if (a.keys[k] == null) {
          details.keys[k] = v;
        }
      }
    }
    if (b.inherit) {
      details.keys = mergeKeys(details, definitions[b.inherit].details);
    }
    return details.keys;
  };

  getDef = function(name) {
    var def;
    def = definitions[name];
    if (!def) {
      throw new Error('Could not find definition: ' + name);
    }
    return def;
  };

  getDefFn = function(name) {
    var def;
    def = definitions[name];
    if (!def) {
      return checkType(name);
    }
    return def.fn;
  };

  check = function(obj, type) {
    return typeof obj === type;
  };

  checkType = function(type) {
    return function(obj) {
      return typeof obj === type;
    };
  };

  define = function(name, type, details) {
    var all, def, inherit, key, keys, typeCheck, value, _ref;
    if (definitions[name]) {
      throw new Error('Definition already defined: ' + name);
    }
    def = definitions[name] = {
      name: name,
      type: type,
      details: details
    };
    typeCheck = getDefFn(type);
    if (!details) {
      return def.fn = getDefFn(type);
    }
    if (check(details, 'function')) {
      return def.fn = function(obj) {
        if (!typeCheck(obj)) {
          return false;
        }
        return details(obj);
      };
    }
    all = details.all;
    if (all) {
      all = getDefFn(all);
    }
    if (details.keys) {
      _ref = details.keys;
      for (key in _ref) {
        value = _ref[key];
        details.keys[key] = getDefFn(value);
      }
    }
    keys = details.keys;
    inherit = null;
    if (typeof details.inherit === 'string') {
      keys = mergeKeys(def.details, getDef(details.inherit).details);
    }
    return def.fn = function(obj) {
      if (!typeCheck(obj)) {
        return false;
      }
      if (inherit) {
        if (!inherit(obj)) {
          return false;
        }
      }
      for (key in obj) {
        if (!__hasProp.call(obj, key)) continue;
        value = obj[key];
        if (all) {
          if (!all(value)) {
            return false;
          }
        } else if (keys) {
          if (keys[key]) {
            if (!keys[key](value)) {
              return false;
            }
          } else if (!details.other) {
            return false;
          }
        }
      }
      return true;
    };
  };

  defineFn = function() {
    var args, fn, name, type, types, _i, _len;
    name = arguments[0], types = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    args = [];
    for (_i = 0, _len = types.length; _i < _len; _i++) {
      type = types[_i];
      if (type[0] === '~') {
        fn = getDefFn(type.slice(1));
        fn.optional = true;
      } else {
        fn = getDefFn(type);
      }
      args.push(fn);
    }
    return function() {
      var arg, i, input, _j, _len1;
      input = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (i = _j = 0, _len1 = args.length; _j < _len1; i = ++_j) {
        arg = args[i];
        if (input[i] === void 0 && arg.optional) {
          continue;
        }
        if (!arg(input[i])) {
          return false;
        }
      }
      return true;
    };
  };

  ARRAY = '[object Array]';

  OBJECT = '[object Object]';

  define('*object', 'object');

  define('array', 'object', function(obj) {
    return Object.prototype.toString.call(obj) === ARRAY;
  });

  define('object', '*object', function(obj) {
    return Object.prototype.toString.call(obj) === OBJECT;
  });

  module.exports = {
    define: define,
    defineFn: defineFn,
    undefine: undefine
  };

}).call(this);
