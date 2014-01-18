var log = function () {
  var args = Array.prototype.slice.call(arguments);
  args.unshift('\u001b[31m[xType]');
  args.push('\u001b[0m');
  console.log.apply(console, args);
};

var toString = function (obj) {
  if (obj === null || obj === undefined) {
    return obj;
  } else if (typeof obj === 'function') {
    return '[function]';
  } else {
    return obj.toString();
  }
};


module.exports = {

  /*
   * Guard
   */

  guard: function (type, fn, ctx) {
    return function () {
      if (type(arguments)) {
        return fn.apply(ctx, arguments);
      }
      log('guard blocked call');
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
          log('Input ' + toString(input[i]));
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
      if (! type(obj)) { log('custom - type'); return false; }
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
      if (! type(obj)) { log('single - type'); return false; }

      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          value = obj[key];
          if (! propType(value)) {
            log('single - prop: ' + toString(value));
            return false;
          }
        }
      }

      return true;
    };
  },

  single_req: function(type, propType, required) {
    var len = required.length;
    return function(obj) {
      var key, value;
      if (! type(obj)) { log('single_req - type'); return false; }

      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          value = obj[key];
          if (! propType(value)) {
            log('single_req - prop:' + toString(value));
            return false;
          }
        }
      }

      for (i = 0; i < len; i++) {
        if (! obj.hasOwnProperty(required[i])) {
          log('single_req - req: ' + required[i]);
          return false;
        }
      }

      return true;
    };
  },


  /*
   * Basic
   *
   * Check that all properties in the object match against the keys.
   * Will return false if the object has a property not listed in keys.
   *
   * - type (function) : to test object type
   * - keys (object) : functions to check each property
  */

  basic: function(type, keys) {
    return function(obj) {
      var fn, key, value;
      if (! type(obj)) { log('basic - type'); return false; }

      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          value = obj[key];
          fn = keys[key];
          if (! fn || ! fn (value)) {
            log('basic - prop: ' + toString(value));
            return false;
          }
        }
      }

      return true;
    };
  },

  basic_req: function(type, keys, required) {
    var len = required.length;
    return function(obj) {
      var fn, key, value, i;
      if (! type(obj)) { log('basic_req - type'); return false; }

      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          value = obj[key];
          fn = keys[key];
          if (! fn || ! fn (value)) {
            log('basic_req - prop: ' + toString(value));
            return false;
          }
        }
      }

      for (i = 0; i < len; i++) {
        if (! obj.hasOwnProperty(required[i])) {
          log('basic_req - req: ' + required[i]);
          return false;
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
      if (! type(obj)) { log('flexible - type'); return false; }

      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          value = obj[key];
          fn = keys[key];
          if (fn && ! fn (value)) {
            log('flexible - prop: ' + toString(value));
            return false;
          }
        }
      }

      return true;
    };
  },

  flexible_req: function(type, keys, required) {
    var len = required.length;
    return function(obj) {
      var fn, key, value;
      if (! type(obj)) { log('flexible_req - type'); return false; }

      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          value = obj[key];
          fn = keys[key];
          if (fn && ! fn (value)) {
            log('flexible_req - prop: ' + toString(value));
            return false;
          }
        }
      }

      for (i = 0; i < len; i++) {
        if (! obj.hasOwnProperty(required[i])) {
          log('flexible_req - req: ' + required[i]);
          return false;
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
        keys.__proto__ = null;
        log('switchProto - check(obj) failed');
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

    basic: function(type, keys, protoFn) {
      return function(obj) {
        var fn, key, value;
        if (! type(obj)) { log('inherit.basic - type'); return false; }

        protoFn(obj);

        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            value = obj[key];
            fn = keys[key];
            if (! fn || ! fn(value)) {
              log('inherit.basic - prop: ' + toString(value));
              return false;
            }
          }
        }

        return true;
      };
    },

    basic_req: function(type, keys, protoFn, required) {
      var len = required.length;
      return function(obj) {
        var fn, key, value;
        if (! type(obj)) { log('inherit.basic_req - type'); return false; }

        protoFn(obj);

        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            value = obj[key];
            fn = keys[key];
            if (! fn || ! fn(value)) {
              log('inherit.basic_req - prop: ' + toString(value));
              return false;
            }
          }
        }

        for (i = 0; i < len; i++) {
          if (! obj.hasOwnProperty(required[i])) {
            log('inherit.basic_req - req: ' + required[i]);
            return false;
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
        if (! type(obj)) { log('inherit.flexible - type'); return false; }

        protoFn(obj);

        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            value = obj[key];
            fn = keys[key];
            if (fn && ! fn(value)) {
              log('inherit.flexible - prop: ' + toString(value));
              return false;
            }
          }
        }

        return true;
      };
    },


    flexible_req: function(type, keys, protoFn, required) {
      var len = required.length;
      return function(obj) {
        var fn, key, value;
        if (! type(obj)) { log('inherit.flexible_req - type'); return false; }

        protoFn(obj);

        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            value = obj[key];
            fn = keys[key];
            if (fn && ! fn(value)) {
              log('inherit.flexible_req - prop: ' + toString(value));
              return false;
            }
          }
        }

        for (i = 0; i < len; i++) {
          if (! obj.hasOwnProperty(required[i])) {
            log('inherit.flexible_req - req: ' + required[i]);
            return false;
          }
        }

        return true;
      };
    }
  }
};
