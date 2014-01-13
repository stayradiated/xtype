xType
=====

> Simple object type checking

xType is just a simple way to quickly validate that an object is of a certain
structure. It's goal is to be lightweight and fast.

## Usage

xType exposes two main functions: `define` and `defineFn`.

```javascript
xtype.define(<name>, <type>, <options>)
```

- `name`: name of the definition. Can only be used once.
- `type`: the raw type of the object, such as 'object' or 'array'
- `options`: an object or function that is used for validation

```javascript
xtype.defineFn(<name>, <types...>)
```

- `name`: name of the function.
- `types`: each argument of the function is given one argument

## Definitions

You use xType by creating 'definitions' that document what an object should
consist of.

```javascript
define('address', 'object', {
    keys: {
        street: 'string',
        city: 'string'
    }
});

test = define('user', 'object', {
    keys: {
        id: 'number',
        name: 'string',
        address: 'address'
    }
});

test({
    id: 10,
    name: 'John',
    address: {
        number: 27,
        street: 'Road
    }
})
```

## Options


### Keys

Keys allow you to specify what keys an object can have to be valid. If the type
does not match, or if an object has a key that is not in 'keys', then it will
return false.

```javascript
test = define('special_object', 'object', {
    keys: {
        id: 'number'
        name: 'string'
    }
});

test({ id: 10, name: 'word' }); // true
test({ id: 'word', name: 10 }); // false

test = define('special_array', 'array', {
    keys: {
        0: 'number',
        1: 'string'
    }
});

test([10, 'word']); // true
test(['word', 10]); // false
```

### Other

Other makes the test more flexible - meaning that it will ignore any properties
on an object that

```javascript
test = define('standard', 'object', {
    keys: {
        id: 'number'
    }
});

test({ id: 20, name: 'word' }); // false

test = define('flexible', 'object', {
    other: true,
    keys: {
        id: 'number'
    }
});

test({ id: 20, name: 'word' }); // true
```


### All

Setting options.all means that all properties of the object must be that type.

This can only be used by itself, and cannot be used with 'keys', 'other' or
'inheritance'.

```javascript
test = define('array_of_strings', 'array', {
    all: 'string'
});

test(['an', 'array', 'of', 'strings']); // true
test([1, 2, 3, 4, 5]); // false
```

## Primitive Types

xType is very flexible about what types are. So you can easily use it with
other type validation libraries.

If you supply a type and a function, they will be used to create a function
that firsts check that an object is of that type, and if so will then check it
against your function.

```javascript
var email = define('email', 'string', function (str) {
    return !! str.match(/.+@.+\..+/);
});

email('john@smith.com'); // true
email('johnsmitcom');    // false
email(30);               // false
email({{}});             // false


var validator = require('validator');
var uppercase = define('uppercase', 'string', validator.isUppercase);
uppercase('TRUE');
uppercase('FaLsE');
uppercase('false');
```

You can just have a completly raw function that will do all the checking. This
is particulary useful for combining it with other libraries that already do
type checking for you.

```javascript
var array = define('array', function (obj) {
    Object.prototype.toString.call(obj) === '[object Array]';
});
```

## Inheritance

xType allows you to split definitions in multiple sections, so you don't have
to repeat yourself all the time.

```javascript
define('model', 'object', {
    keys: {
        id: 'number',
        name: 'string'
    }
});

task = define('task', 'object', {
    inherit: 'model',
    keys: {
        completed: 'boolean',
        notes: 'string'
    }
});

define('taskArray', 'array', {
    all: 'task'
});

list = define('list', 'object', {
    inherit: 'model',
    keys: {
        tasks: 'taskArray'
    }
});

task({
    id: 20,
    name: 'Just a task',
    completed: true,
    notes: 'Finish xType'
}); // true

list({
    id: 10,
    tasks: [
        {
            id: 1,
            name: 'a task in a list',
            completed: false,
            notes: ''
        },
        {
            id: 2,
            name: 'another task',
            completed: false,
            notes: 'with some notes'
        }
    ]
}); // true
````

## Todo

- [x] Use native object prototypes for inheritance
- [ ] Write more tests
- [ ] Refactor code so it's not horrible
- [ ] Convert coffee-script to javascript
