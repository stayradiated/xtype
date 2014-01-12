xType
=====

> Simple object type checking

xType is just a simple way to quickly validate that an object is of a certain
structure. It's goal is to be lightweight and fast.

## Usage

xType exposes two main functions: `define` and `defineFn`.

    xtype.define(<name>, <type>, <structure>)

- `name`: name of the definition. Can only be used once.
- `type`: the raw type of the object, such as 'object' or 'array'
- 'structure': an object or function that is used for validation

    xtype.defineFn(<name>, <types...>)

- `name`: name of the function. 
- `types`: each argument of the function is given one argument

## Definitions

You use xType by creating 'definitions' that document what an object should
consist of.

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

