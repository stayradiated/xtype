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

test = define('task', 'object', {
    inherit: 'base',
    keys: {
        completed: 'boolean',
        notes: 'string'
    }
});

test({
    id: 20,
    name: 'Just a task',
    completed: true,
    notes: 'Finish xType'
})
````

## TODO

- Use native object prototypes for inheritance
- Refactor code so it's not horrible
- Convert coffee-script to javascript
