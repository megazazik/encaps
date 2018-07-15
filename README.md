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
	.subActions({
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
The main idea of this package it to build independent modeles that consists of action creators and a reducer.

```typescript
interface Model {
	/**
	 * List of action creators
	 */
	readonly actions: ActionCreators;

	readonly reducer: (state, action) => object;
}
```

The `actions` field of model is a map that contains of functions which get payload and return action. Action creators can be nested.

```typescript
interface ActionCreators {
	{[key: string]: ((payload) => Action) | ActionCreators} 
}

interface Action {
	type: string;
	payload: any;
}
```

The main function you can use to build model is `build`. It gets existing model or can be invoked without parameters.
```typescript
import { build } from 'encaps';

const model = build();
const model2 = build(model);
```

The `build` function returns a `Builder` object.

```typescript
interface Builder {
	/**
	 * You can set function that create initial state
	 * This function gets state created by previous initState function (it can be used then you extends existing model).
	 * @returns new Builder
	 */
	setInitState(f: (state) => object): Builder;

	/**
	 * Adds new action creators to model and handlers for new types of actions/
	 * @returns new Builder
	 */
	action(
		/** map of action handlers */
		handlers: {[K: string]: (state, action: Action) => object}
	): Builder;

	/**
	 * Adds child model
	 * @returns new Builder
	 */
	child(
		/** child model key */
		key: K,
		model: Model
	): Builder;

	/**
	 * patches action creators to add sub actions to created actions.
	 * @returns new Builder
	 */
	subActions(
		/** map of functions that create additional actions */
		wrapers: {[K: string]: (action, actions) => Action}
	): Builder;
}
```

Also `Builder` contains `actions` and `reducer` fields. So you can use it as a model.

You can create nested model by `child` methid of `Builder`. But sometimes you need to create dynamic list of children models. You can you `createMap` and `createList` to do that.
```typescript
import { createList, createMap } from 'encaps';
import model from './model';

const listModel = createList(model);
const mapModel = createMap(model);
```
