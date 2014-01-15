var Dictionary, bind;

bind = function (fn, me) {
  return function () {
    return fn.apply(me, arguments);
  };
};

function Dictionary() {
  this.remove = bind(this.remove, this);
  this.add = bind(this.add, this);
  this.get = bind(this.get, this);
  this.definitions = {};
}

Dictionary.prototype.get = function(name) {
  var def = this.definitions[name];
  if (!def) {
    throw new Error('Could not find definition: ' + name);
  }
  return def;
};

Dictionary.prototype.add = function(name, obj) {
  if (this.definitions[name]) {
    throw new Error('Definition already defined: ' + name);
  }
  this.definitions[name] = obj;
  return obj;
};

Dictionary.prototype.remove = function(name) {
  return delete this.definitions[name];
};

module.exports = Dictionary;
