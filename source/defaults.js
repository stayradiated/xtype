var ARRAY, OBJECT, define;

define = require('./xtype').define;

ARRAY = '[object Array]';
OBJECT = '[object Object]';

define('array', function(obj) {
  return Object.prototype.toString.call(obj) === ARRAY;
});

define('object', function(obj) {
  return Object.prototype.toString.call(obj) === OBJECT;
});

define('string', function(obj) {
  return typeof obj === 'string';
});

define('number', function(obj) {
  return typeof obj === 'number';
});

define('boolean', function(obj) {
  return typeof obj === 'boolean';
});

define('function', function(obj) {
  return typeof obj === 'function';
});

define('_object', function(obj) {
  return typeof obj === 'object';
});
