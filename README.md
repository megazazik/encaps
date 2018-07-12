# encaps
The library to build independent, reusable and extensible modules for Flux/Redux aplications, which consist of reducers and action creators.

# Getting Started

## Installation

```bash
$ npm install encaps
```

or

```
$ yarn add encaps
```

## Usage

### Simple reducer
```js
import { build } from 'encaps';

export const { actions, reducer } = build()
	.setInitState(() => ({counter: 10}))
	.action({
		increment: (state, action) => ({...state, counter: state.counter + action.payload}),
		decrement: (state, action) => ({...state, counter: state.counter - action.payload}),
	});

const initState = reducer(); // {counter: 10}

actions.increment(1); // {type: 'increment', payload: 1}
actions.decrement(2); // {type: 'decrement', payload: 2}

reducer(initState, actions.decrement(2)); // {counter: 8}
```

### Reducer extention
```js
import { build } from 'encaps';
import { actions, reducer } from './someModel'; // from previous example

export const model = build({ actions, reducer })
	// you can supplement an origin state
	.setInitState((state) => ({...state, active: false}))
	// and add some actions
	.action({
		disable: (state) => ({...state, active: false}),
		enable: (state) => ({...state, active: true}),
	});

// state contains two values now
model.reducer(); // init state - {counter: 10, active: false}

// you can create new and old actions
model.actions.increment(1); // {type: 'increment', payload: 1}
model.actions.disable(); // {type: 'disable'}
```

### Reducers hierarchy
```js
import { build } from 'encaps';
import { actions, reducer } from './someModel'; // from the first example

export const parentModel = build()
	.setInitState((state) => ({...state, active: false}))
	.action({
		disable: (state) => ({...state, active: false}),
		enable: (state) => ({...state, active: true}),
	})
	.child('Child1', { actions, reducer })
	.child('Child2', { actions, reducer });

// parentModel state contains children's state
const initState = parentModel.reducer();
/* {
	active: false,
	Child1: {counter: 10},
	Child2: {counter: 10}
} */

parentModel.actions.disable(); // {type: 'disable'}
// you can create children's actions with prefix
parentModel.actions.Child1.increment(1); // {type: 'Child1.increment', payload: 1}
parentModel.actions.Child2.decrement(2); // {type: 'Child2.decrement', payload: 2}
// level of nesting is not limited
```

### Independence of adjacent modules 
I prefer to make adjacent modules as independant as possible. They should not know about other modules.
Only a parent module can be aware of its own children's modules.
So if you need to organize interaction between two children modules you can do it from parent by wrapping child action.

```js
import { build } from 'encaps';
import { actions, reducer } from './someModel'; // from the first example

export const parentModel = build()
	.child('Child1', { actions, reducer })
	.child('Child2', { actions, reducer })
	.wrapActions({
		Child1: {
			increment: (payload, actions) => actions.Child2.decrement(payload)
		},
		Child2: {
			decrement: (payload, actions) => actions.Child1.increment(payload)
		}
	});
```

Then every time you dispatch `Child1.increment` the `Child2.decrement` actoin will be dispatched and handled too and vice versa.

### Dynamic list of children

#### Array of children
```js
import { createList } from 'encaps';
import { actions, reducer } from './someModel'; // from the first example

const list = createList({ actions, reducer });

// list has own actions to manipulate items
list.actions.add();
list.actions.subtract();
list.actions.insert(3);
list.actions.remove();

// and you can create any child's action with index
list.actions.item(1).increment(1); // {type: 'item.1.increment', payload: 1}

// list's state contains array of children's state
const initState = list.reducer(); // {items: []}

list.reducer(initState, list.actions.add());
/*
{
	items: [
		{counter: 10}
	]
}
*/
```

#### Map of children
```js
import { createMap } from 'encaps';
import { actions, reducer } from './someModel'; // from the first example

const map = createMap({ actions, reducer });

// map has own actions to manipulate items
map.actions.add('key');
map.actions.remove('key');

// and you can create any child's action with key
map.actions.item('Child1').increment(1); // {type: 'item.Child1.increment', payload: 1}

// map's state contains children's state
const initState = map.reducer(); // {items: {}}

map.reducer(initState, map.actions.add('Child1'));
/*
{
	items: {
		Child1: {counter: 10}
	}
}
*/
```

## API
*The documentation is in the process of being written*
