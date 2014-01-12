xType
=====

> Simple object type checking

xType is just a simple way to quickly validate that an object is of a certain
structure. It's goal is to be lightweight and fast.

## Usage

xType exposes two main functions: `define` and `defineFn`.

```javascript
xtype.define(<name>, <type>, <structure>)
```

- `name`: name of the definition. Can only be used once.
- `type`: the raw type of the object, such as 'object' or 'array'
- `structure`: an object or function that is used for validation

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

## TODO

- Use native object prototypes for inheritance
- Refactor code so it's not horrible
- Convert coffee-script to javascript
