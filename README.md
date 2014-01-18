xType
=====

> Simple object type checking

xType is just a simple way to quickly validate that an object is of a certain
structure. It's goal is to be lightweight and fast.

## Notes:

- You currently can't inherit required properties using a `check` function.


## Usage

xType exposes the following functions:

- define
- get
- defineFn
- getFn
- guard
- undefine

```javascript
xtype.define(<name>, <type>, <options>)
```

- `name`: name of the definition. Can only be used once.
- `type`: the raw type of the object, such as 'object' or 'array'
- `options`: an object or function that is used for validation

```javascript
xtype.undefine(<name>)
```

- `name`: name of the function to remove

```javascript
xtype.defineFn(<name>, <types...>)
```

- `name`: name of the function.
- `types`: each argument of the function is given one argument

```javascript
xtype.get(<name>)
```

- `name`: name of the function

```javascript
xtype.getFn(<name>)
```

- `name`: name of the
```javascript
xtype.guard(<name>, <fn>)
```

- `name`: name of the function definition
- `fn`: function to run if validation passes


## Definitions

You use xType by creating 'definitions' that document what an object should
consist of.

```javascript
xtype.define('address', 'object', {
    keys: {
        street: 'string',
        city: 'string'
    }
});

var test = define('user', 'object', {
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
        street: 'Road'
    }
});
```

## Options


### Keys

Keys allow you to specify what keys an object can have to be valid. If the type
does not match, or if an object has a key that is not in 'keys', then it will
return false.

```javascript
var test = define('special_object', 'object', {
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

### Required Keys

By default, all keys are optional. However, if you need to specify that an
object is valid if it contains a key, you can set it as required.

Do this by prefixing the type with an asterisk.

```javascript
var test = define('required', 'object', {
    keys: {
        id: '*number'
    }
});

test({id: 20}); // true
test({}); // false
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
xtype.define('model', 'object', {
    keys: {
        id: 'number',
        name: 'string'
    }
});

xtype.define('task', 'object', {
    inherit: 'model',
    keys: {
        completed: 'boolean',
        notes: 'string'
    }
});

xtype.define('taskArray', 'array', {
    all: 'task'
});

xtype.define('list', 'object', {
    inherit: 'model',
    keys: {
        tasks: 'taskArray'
    }
});

var task = xtype.get('task');
var list = xtype.get('list');

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
```

## Fancy Inheritance

I haven't thought of a good name for this yet.

Basically you can choose which definition to inherit, based on the object.

To use it you set `inherit` as an possible definitions to inherit, as
well as setting `check` to a function that accepts a single argument: object.

`inherit` can be an object or an array, but whatever the `check` function
returns will be used to try and access the property from it.

```javascript
xtype.define('a', 'object', {
    keys: {
        model: 'string'
    }
});

xtype.define('b', 'object', {
    keys: {
        model: 'number'
    }
});

xtype.define('c', 'object', {
    keys: {
        model: 'boolean'
    }
});


xtype.define('thing', 'object', {
    inherit: ['a', 'b', 'c'],
    check: function (obj) {
        switch (obj.type) {
            case 'a': return 0;
            case 'b': return 1;
            case 'c': return 2;
        }
    }
});

var thing = xtype.get('thing');

thing({
    type: 'a',
    model: 'string'
}); // true

thing({
    type: 'b',
    model: 30
}); // true

thing({
    type: 'c',
    model: true
}); // true

thing({
    type: 'd',
    model: true
}); // false - type d doesn't exist
```

## Function Definitions

This is used to create definitions for function arguments.

### defineFn

The first argument is the name of the function. The rest are the types of each
argument. Every argument is required by default.

```javascript
xtype.defineFn('my_fn', 'string', 'number');
```

#### Optional Properties

Prefix type with a `~` symbol.

It is best to use this only the last argument, as xType won't do anything
special if you make the first argument optional.

```javascript
var test = xtype.defineFn('my_fn', 'string', 'number', '~function');

test('word', 30); // true
test('word', 30, function () {}); // true

test = xtype.defineFn('my_fn_2', '~string', '~number');

test(); // true
test('word'); // true
test(undefined, 30); // true
test(30); // false
```

### getFn

Use this to get a function definition by it's name.

Will throw an error if the definition doesn't exist.

```javascript
var test = xtype.getFn('my_fn');
```

### guard

Use this to 'guard' a function, that will only run if validation passes.

```javascript
xtype.defineFn('my_fn', 'string', 'number');

var fn = function (string, number) {
    // can assume that string is actually a string
    // and that number is really a number
};

// Guard fn
var guard = xtype.guard('my_fn', fn);

// will call fn
guard('word', 30);

// will not call fn
guard();
guard('word');
guard(undefined, 30);
```
