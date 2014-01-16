module.exports = {

  /*
   * Guard
   */

  guard: function (type, fn, ctx) {
    return function () {
      if (type(arguments)) {
        return fn.apply(ctx, arguments);
      }
      return false;
    };
  },

  /*
   * DefineFn
   *
   * - args (array)
   *
   * - input (arguments)
   */

  defineFn: function (args) {
    return function (input) {
      var arg, i, len;
      for (i = 0, len = args.length; i < len; i += 1) {
        arg = args[i];

        if (input[i] === void 0 && arg.optional) {
          continue;
        }

        if (! arg(input[i])) {
          console.log('xType input failed: ' + input[i])
          return false;
        }

      }
      return true;
    };
  },

  /*
   * Custom
   *
   * Uses a custom function combined a single type check
   *
   * - type (function) : type checking function
   * - fn (function) : custom function to use
  */

  custom: function(type, fn) {
    return function(obj) {
      if (! type(obj)) {
        console.log('xType.custom - type check failed', obj)
        return false;
      }
      return fn(obj);
    };
  },


  /*
   * Single
   *
   * Checks that all properties of an object match a certain type
   *
   * - type (function) : to test object type
   * - propType (function) : to test object properties
  */

  single: function(type, propType) {
    return function(obj) {
      var key, value;
      if (! type(obj)) {
        console.log('xType.single - type check failed', obj)
        return false;
      }
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          value = obj[key];
          if (! propType(value)) {
            console.log('xType.single - failed: ' + key + ' - ' + value);
            return false;
          }
        }
      }
      return true;
    };
  },


  /*
   * Strict
   *
   * Check that all properties in the object match against the keys.
   * Will return false if the object has a property not listed in keys.
   *
   * - type (function) : to test object type
   * - keys (object) : functions to check each property
  */

  strict: function(type, keys) {
    return function(obj) {
      var fn, key, value;
      if (! type(obj)) {
        console.log('xType.strict - failed type check', obj)
        return false;
      }
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          value = obj[key];
          fn = keys[key];
          if (! fn || ! fn (value)) {
            console.log('xType.strict - failed: ' + key + ' - ' + value);
            return false;
          }
        }
      }
      return true;
    };
  },


  /*
   * Flexible
   *
   * Check that all properties in the object match against the keys.
   * Will ignore properties not listed in keys.
   *
   * - type (function) : to test object type
   * - keys (object) : functions to check each property
  */

  flexible: function(type, keys) {
    return function(obj) {
      var fn, key, value;
      if (! type(obj)) {
        console.log('xType.flexible - failed type check', obj)
        return false;
      }
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          value = obj[key];
          fn = keys[key];
          if (fn && ! fn (value)) {
            console.log('xType failed for: ' + key + ' - ' + value);
            return false;
          }
        }
      }
      return true;
    };
  },


  /*
   * Set Prototype for Inheritance
   * Called by switchProto
   *
   * - keys (object) : keys to set prototype of
   * - proto (object) : object to set as the prototype
  */

  setProto: function(keys, proto) {
    return function(obj) {
      keys.__proto__ = proto;
    };
  },


  /*
   * Set Prototype for Inheritance AND continue the chain
   * Called by switchProto
   *
   * - keys (object) : keys to set prototype of
   * - proto (object) : possible objects to be the prototype
   * - chain (function) : runs after the prototype has been set
  */

  setProtoChain: function(keys, proto, chain) {
    return function(obj) {
      keys.__proto__ = proto;
      chain(obj);
    };
  },


  /*
   * Switch prototypes for a definition using a custom function
   *
   * - keys (object) : keys to switch prototypes on
   * - protoFns (object) : possible prototypes to use
   * - check (function) : to decide which prototype to use
  */

  switchProto: function(keys, protoFns, check) {
    return function(obj) {
      var index = check(obj);
      if (index == null || ! protoFns.hasOwnProperty(index)) {
        console.log('xType.switchProto - failed index', index)
        keys.__proto__ = null;
        return false;
      }
      protoFns[index](obj);
    };
  },


  /*
   * Inherit
   *
   * These functions run an seperate function called `inheritFn` that sets up
   * the keys prototype value
  */

  inherit: {


    /*
     * Strict + Custom Inherit
     *
     * - type (function)
     * - keys (object)
     * - protoFn (array)
    */

    strict: function(type, keys, protoFn) {
      return function(obj) {
        var fn, key, value;
        if (! type(obj)) {
          console.log('xType.inherit.strict - failed type check', obj)
          return false;
        }

        protoFn(obj);

        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            value = obj[key];
            fn = keys[key];
            if (! fn || ! fn(value)) {
              console.log('xType.inherit.strict - failed:', key, value)
              return false;
            }
          }
        }
        return true;
      };
    },


    /*
     * Flexible + Custom Inherit
     *
     * - type (function)
     * - keys (object)
     * - protoFn (array)
    */

    flexible: function(type, keys, protoFn) {
      return function(obj) {
        var fn, key, value;
        if (! type(obj)) {
          console.log('xType.inherit.flexible - failed type check', obj)
          return false;
        }

        protoFn(obj);

        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            value = obj[key];
            fn = keys[key];
            if (fn && ! fn(value)) {
              console.log('xType.inherit.flexible - failed:', key, value)
              return false;
            }
          }
        }
        return true;
      };
    }
  }
};