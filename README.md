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
	.initState(() => ({counter: 10}))
	/**
	 * Functions to handle actions
	 * A reducer will consist of them
	 */ 
	.handlers({
		increment: (state, action) => ({...state, counter: state.counter + action.payload}),
		decrement: (state, action) => ({...state, counter: state.counter - action.payload}),
		/** 
		 * a string value is a shortcut for
		 * (state, action) => ({...state, counter: action.payload}),
		 */
		setCounter: 'counter'
	});

const initState = reducer(); // {counter: 10}

actions.increment(1); // {type: 'increment', payload: 1}
actions.decrement(2); // {type: 'decrement', payload: 2}
actions.setCounter(3); // {type: 'setCounter', payload: 3}

reducer(initState, actions.decrement(2)); // {counter: 8}
reducer(initState, actions.setCounter(3)); // {counter: 3}
```

### Reducer extension
```js
import { build } from 'encaps';
import { actions, reducer } from './someModel'; // from previous example

export const model = build({ actions, reducer })
	// you can supplement an origin state
	.initState((state) => ({...state, active: false}))
	// and add some actions
	.handlers({
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
	.initState((state) => ({...state, active: false}))
	.handlers({
		disable: (state) => ({...state, active: false}),
		enable: (state) => ({...state, active: true}),
	})
	.child('Child1', { actions, reducer })
	.children({Child2: { actions, reducer }});

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
So if you need to organize interaction between two children modules you can do it from the parent by wrapping child action.

```js
import { build } from 'encaps';
import { actions, reducer } from './someModel'; // from the first example

export const parentModel = build()
	.children({
		Child1: { actions, reducer },
		Child2: { actions, reducer },
	})
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

### Dispatching no object action
If you need to dispatch actions which are not simple objects, for example, functions with using redux-think, you can use the `effects` and `effect` methods of a builder.
```js
import { build } from 'encaps';

export const model = build()
	.initState(() => ({value: true}))
	.handlers({
		set: (state, {payload}) => ({...state, value: payload})
	})
	.effect(
		'thunk1',
		(actions, select) => () => (dispatch, getState) => {
			...
			/** some async code */
			...
			const state = select(getState()); // get current state
			...
			dispatch(actions.set(false))
		}
	)
	.effects({
		thunk2: (actions, select) => () => (dispatch, getState) => {
			...
			/** some async code */
			...
			const state = select(getState()); // get current state
			...
			dispatch(actions.set(true))
		},
		thunk3: (actions, select) => (payload) => (dispatch, getState) => {
			...
			/** some async code */
			...
			const state = select(getState()); // get current state
			...
			dispatch(actions.set(payload))
		},
	})
	
dispatch(model.actions.thunk3(false));
```
An effect is a function which receives actions of the current builder and a `select` function to receive a current state of a model. The effect function should return an action creator. This action creator can return a function, a promise or something else.

A `select` function can be useful then you need to receive a state of a current model from a state of a current page.

### Dynamic list of children

#### Array of children
```js
import { createList } from 'encaps';
import { actions, reducer } from './someModel'; // from the first example

const list = createList({ actions, reducer });

// list's state contains array of children's state
const initState = list.reducer(); // {items: []}

// and you can create any child's action with index
list.actions.item(1).increment(1); // {type: 'item.1.increment', payload: 1}
```
You can create your own actions to manipulate a list
```js
const list = createList({ actions, reducer });
	.handlers({
		add: (state) => ({...state, items: [...state.items, {counter: 10})]})
	});

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

// map's state contains children's state
const initState = map.reducer(); // {items: {}}

// and you can create any child's action with key
map.actions.item('Child1').increment(1); // {type: 'item.Child1.increment', payload: 1}
```
You can create your own actions to manipulate a map
```js
const map = createMap({ actions, reducer });
	.handlers({
		add: (state, action: IAction<string>) => ({...state, items: {...state.items, [action.payload]: {counter: 10}}})
	});

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
The main idea of this package it to build independent modeles which consists of action creators and a reducer.

```typescript
interface Model {
	/**
	 * List of action creators
	 */
	readonly actions: ActionCreators;

	readonly reducer: (state, action) => object;
}
```

The `actions` field of model is a map which contains of functions which get payload and return action. Action creators can be nested.

```typescript
interface ActionCreators {
	{[key: string]: ((payload) => Action) | ActionCreators | any} 
}

interface Action {
	type: string;
	payload: any;
}
```

The main function you can use to build model is `build`. It gets an existing model or can be invoked without parameters.
```typescript
import { build } from 'encaps';

const model = build();
const model2 = build(model);
```

The `build` function returns a `Builder` object.

```typescript
interface Builder {
	/**
	 * You can set function which create initial state
	 * This function gets state created by previous initState function (it can be used then you extends existing model).
	 * @returns new Builder
	 */
	initState(f: (state) => object): Builder;

	/**
	 * Adds new action creators to model and handlers for new types of actions
	 * @returns new Builder
	 */
	handlers(
		/** 
		 * Map of action handlers
		 * You can set a model field name instead of a function to create a function which changes this field of the model
		 */
		handlers: {[K: string]: ((state, action: Action) => object) | string}
	): Builder;

	/**
	 * Adds child model
	 * @returns new Builder
	 */
	child(
		/** child model key */
		key: string,
		model: Model
	): Builder;

	/**
	 * Adds children's models
	 * @returns new Builder
	 */
	children(
		/** map of children */
		handlers: {[K: string]: Model}
	): Builder;

	/**
	 * patches action creators to add sub actions to created actions.
	 * @returns new Builder
	 */
	subActions(
		/** map of functions which create additional actions */
		wrapers: {[K: string]: (action, actions) => Action}
	): Builder;

	/**
	 * adds action creator which can return something different from simple object
	 * @returns new builder
	 */
	effect(
		/** action key */
		key: K,
		/** function should return an action creator */
		effect: (actions, select) => (...args) => any
	): Builder;

	/**
	 * adds action creators which can return something different from simple object
	 * @returns new builder
	 */
	effects(
		/** map of effects */
		effects: {[K: string]: (actions, select) => (...args) => any}
	): Builder;
}
```

Also `Builder` contains `actions` and `reducer` fields. So you can use it as a model.

You can create nested model by `child` or `children` method of `Builder`. But sometimes you need to create dynamic list of children models. You can you `createMap` and `createList` to do that.
```typescript
import { createList, createMap } from 'encaps';
import model from './model';

const listModel = createList(model);
const mapModel = createMap(model);
```

if you need a type of an action which will be created by an action creator you can use a `type` property of the action creator.
It can be useful for example with the `takeEvery` function of `redux-saga`.
```typescript
const model = build()
	.initState(() => ({counter: 10}))
	.handlers({
		increment: (state, action) => ({...state, counter: state.counter + action.payload}),
		decrement: (state, action) => ({...state, counter: state.counter - action.payload}),
	});

model.actions.increment.type // 'increment'
model.actions.decrement.type // 'decrement'

const parent = build().children({model});

parent.actions.model.increment.type // 'model.increment'
parent.actions.model.decrement.type // 'model.decrement'
```

## Interface changes
Methods `setInitState` and `action` were marked as deprecated. Use `initState` and `handlers` instead.

Old actions for `list` and `map` are removed. You can write your own actions.
