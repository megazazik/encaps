# encaps

[![npm version](https://badge.fury.io/js/encaps.svg)](https://badge.fury.io/js/encaps)

`encaps` is a library to create independent, reusable and extensible modules for applications which use reducers. You can use `encaps` with `redux` or with the `useReducer` hook of `react`.

## Counters example

```javascript
import { build } from "encaps";

const counter = build()
  .initState(() => ({ value: 0 }))
  .handlers({
    increment: state => ({ value: state.value + 1 }),
    decrement: state => ({ value: state.value - 1 })
  });

const counters = build().children({
  counterA: counter,
  counterB: counter
});

counters.actions.counterA.decrement(); // {type: 'counterA.decrement'}

counters.reducer(undefined, counters.actions.counterA.increment());
// { counterA: {value: 1}, counterB: {value: 0} }
```

## Reuse of reducers

Reducers are a convenient way to describe a logic of applications. But sometimes you can't easy reuse reducers on several places. If you have a reducer and its action creators then action types conflict can cause when you place it in an other page. And there is no way to easy use reducer to manage several parts of a page state.

For example, you can create a reducer and action creators to manage a state of a counter:

```javascript
function counterReducer(state = 0, action) {
  switch (action.type) {
    case "INCREMENT":
      return state + 1;
    case "DECREMENT":
      return state - 1;
    default:
      return state;
  }
}

function increment() {
  return { type: "INCREMENT" };
}

function decrement() {
  return { type: "DECREMENT" };
}
```

And if you want to create several counters on a page, you can try to do it with this code:

```javascript
import { combineReducers } from "redux";

const rootReducer = combineReducers({
  counterA: counterReducer,
  counterB: counterReducer,
  counterC: counterReducer
});
```

But then any action of counter will change all counter states.

`encaps` is created to solve these problems.

## children

To create several independent instances of the counter you can use the `children` function. This function is similar to the `combineReducers` function from `redux`. But `combineReducers` receives and returns reducers and `children` receives and returns reducers and its action creators.

```javascript
import { children } from "encaps";

const counterActions = { increment, decrement };

const { reducer: rootReducer, actions: rootActions } = children({
  counterA: { reducer: counterReducer, actions: counterActions },
  counterB: { reducer: counterReducer, actions: counterActions },
  counterC: { reducer: counterReducer, actions: counterActions }
});
```

After that a state of `rootReducer` has the following shape:

```javascript
{
	counterA: number,
	counterB: number,
	counterC: number,
}
```

And `rootActions` consists of action creators for each of three instances of the counter.

```javascript
{
	counterA: {
		increment: function,
		decrement: function,
	},
	counterB: {
		increment: function,
		decrement: function,
	},
	counterC: {
		increment: function,
		decrement: function,
	},
}
```

You can create actions by this way:

```javascript
rootActions.counterA.increment(); // {type: 'counterA.INCREMETNT'}
rootActions.counterB.decrement(); // {type: 'counterB.DECREMETNT'}
```

Actions with the `counterB` prefix affects only a state of counter with the `counterB` prefix.

It is conveniently to combine a reducer and action creators into one object. Lets call it a _model_:

```javascript
const counterModel = {
  reducer: counterReducer,
  actions: { increment, decrement }
};

const rootModel = children({
  counterA: counterModel,
  counterB: counterModel,
  counterC: counterModel
});

rootModel.reducer(undefined, { type: "init" });
/*
{
	counterA: 0,
	counterB: 0,
	counterC: 0,
}
*/

rootModel.actions.counterA.increment(); // {type: 'counterA.INCREMETNT'}
```

A nesting level of these model is not limited.

```javascript
// create a counter model
const counter = { reducer: counterReducer, actions: { increment, decrement } };

// create a parent model which consists of several counters
const parentModel = children({
  counter1: counter,
  counter2: counter
});

// create a root model which consists of several parent models
const rootModel = children({
  parent1: parentModel,
  parent2: parentModel
});

// a state of the root model
rootModel.reducer(undefined, { type: "init" });
/*
{
	parent1: {
		counter1: 0,
		counter2: 0
	},
	parent2: {
		counter1: 0,
		counter2: 0
	},
}
*/

rootModel.actions.parent1.counter1.increment(); // {type: 'parent1.counter1.INCREMETNT'}
```

## createList

Sometimes a number of component instances is dynamic. Then you can use the `createList` function. It can add dynamic list of models to a state.

```javascript
import { createList } from "encaps";
const counterModel = {
  reducer: counterReducer,
  actions: { increment, decrement }
};

const counterList = createList(counterModel);
```

A state of the counter list has the following shape:

```javascript
{
  items: [
    /* an array of counter states */
  ];
}
```

To change a state of a list item you can create action with an index of the item in the action's type.

```javascript
counterList.actions.item(1).increment(); // {type: 'item.1.INCREMENT'};
```

Actions with an index changes a state of elements with such index only. If there is no item with the index, the list state will not be changed.

```javascript
counterList.reducer({ items: [0, 0] }, counterList.actions.item(1).increment()); // {items: [0, 1]} - the item with the index 1 has been changed

counterList.reducer({ items: [0, 0] }, counterList.actions.item(3).increment()); // {items: [0, 0]} - there is no item with the index 3. No state has been changed
```

You can create own actions to add and delete list items.

```javascript
// create a new action creator type
function addItem() {
  return { type: "ADD_ITEM" };
}

// create a reducer which processes new actions
function listReducerWithAdditionalActions(state = { items: [] }, action) {
  switch (action.type) {
    // add a list item
    case "ADD_ITEM":
      return { items: [...state.items, 0] };
    default:
      return counterList.reducer(state, action);
  }
}

listReducerWithAdditionalActions({ items: [0, 0] }, addItem()); // {items: [0, 0, 0]}
```

The `createList` function returns an object which has a `handlers` method. You can use this method to create new actions easy. The `handlers` method creates a new action creator and a handler for this type of action (see details [here](#handlers)).

```javascript
const counterList = createList(counterModel).handlers({
  addItem: (state, action) => ({ items: [...state.items, 0] })
});

counterList.actions.addItem(); //{type: 'addItem'}
```

This code adds a new action to add items as in the code above.

Lists can be added as children to other models.

```javascript
const rootModel = children({
  counterA: counterModel,
  counterList: counterList
});
```

The `rootReducer` state has the following shape:

```javascript
{
	counterA: number,
	counterList: {items: [...numbers]}
}
```

The root model actions:

```javascript
rootModel.actions.counterList.item(2).increment(); // {type: 'counterList.item.2.INCREMENT'}
```

## createMap

The `createMap` function ia similar to `createList`, but it creates a model which works with objects instead of arrays.

```javascript
import { createMap } from "encaps";

const counterMap = createMap(counterModel);

counterMap.actions.item("counter1").increment(); // {type: 'item.counter1.INCREMENT'};

counterList.reducer(
  {
    items: {
      counter1: 0,
      counter2: 0
    }
  },
  counterList.actions.item("counter1").increment()
);
/*
{items: {
	counter1: 1,
	counter2: 0,
}}
*/
```

## Methods to create models (reducers and action creators)

`encaps` can work with reducers created with plain js or some third party libraries (like `redux-actions`) and it has its own methods to create models.

`encaps` has a `build` function. It returns a object to create a reducer and action creators.

```js
import { build } from "encaps";

export const counterModel = build()
  // set init state
  .initState(() => ({ value: 0 }))
  // add action creators and functions which process such actions
  .handlers({
    increment: (state, action) => ({ ...state, value: state.value + 1 }),
    decrement: (state, action) => ({ ...state, value: state.value - 1 })
  });

// an initial state of the reducer is an object which is returned by function in initState
counterModel.reducer(undefined, { type: "init" }); // {value: 0}

// the code above creates action creators for actions with types increment and decrement
counterModel.actions.increment(); // {type: 'increment'}
counterModel.actions.decrement(); // {type: 'decrement'}

counterModel.reducer({ value: 3 }, counterModel.actions.decrement()); // {value: 2}
```

Action creators created by the `handlers` function has an optional parameter `payload`.

```js
counterModel.handlers({
  addMany: (state, action) => ({
    ...state,
    value: state.value + action.payload
  })
});

counterModel.actions.addMany(10); // {type: 'addMany', payload: 10}

counterModel.reducer({ value: 3 }, counterModel.actions.addMany(10)); // {value: 13}
```

To create simple handlers which changes a property value you can use a short form. The 2 following code fragments make the same result.

```js
counterModel.handlers({
  setValue: (state, action) => ({ ...state, value: action.payload })
});
// similar to the following
counterModel.handlers({
  setValue: "value"
});
```

## Extension of model functionality

Each method of object which creates models returns a new independent object. Changes of a new object don't affect an original model. So you can extend model by adding functionality.

```js
const user = build()
  .initState(() => ({ name: "", email: "" }))
  .handlers({
    setName: "name",
    setEmail: "email"
  });

// create a model of user with an additional property 'phone'
const userWithPhone = user
  .initState(originalState => ({ ...originalState, phone: "" }))
  .handlers({ setPhone: "phone" });

userWithPhone.reducer(undefined, { type: "init" }); // {name: '', email: '', phone: ''}

// create a model of user with an additional property 'login'
const userWithLogin = user
  .initState(originalState => ({ ...originalState, login: "" }))
  .handlers({ setLogin: "login" });

userWithLogin.reducer(undefined, { type: "init" }); // {name: '', email: '', login: ''}
```

You can create a model of user and extends it with new properties. When you use an `initState` method of an existed model this method accepts initial state of the original model as the first parameter.

## Processing actions of other models

The main idea of `encaps` is reusable reducers. So they should be as independent as possible.

Suppose we need to store a list of books and we must be able to create, modify and delete them.

```js
export const ADD_BOOK = 'ADD_BOOK';
export const DELETE_BOOK = 'DELETE_BOOK';
export const EDIT_BOOK = 'EDIT_BOOK';

const addBook = (payload) => ({type: ADD_BOOK, payload})
const deleteBook = (payload) => ({type: DELETE_BOOK, payload})
const editBook = (payload) => ({type: EDIT_BOOK, payload})

function booksReducer (state, action) {...}
```

And we have a list of favorites books. We can add books to favorites and delete them from favorites.

```js
const addFavorite = (payload) => ({type: 'ADD_FAVORITE', payload})
const deleteFavorite = (payload) => ({type: 'DELETE_FAVORITE', payload})

function favoritesReducer (state, action) {...}
```

If we delete a book from the book list we need to delete this book from the favorites list. Usually the reducer of favorites list should change its state when the `DELETE_BOOK` action is dispatched.

```js
import { DELETE_BOOK } from './book';

function favoritesReducer (state, action) {
	switch (action.type) {
		...
		case DELETE_BOOK:
			// deletion from favorites
		case ...
	}
}
```

So the favorites reducer is dependent of the book model action. So you can't use the favorites reducer without the books actions.

To remove this dependency the favorites reducer should not react the books model actions. We can write a middleware which will dispatch a `DELETE_FAVORITE` action every time a `DELETE_BOOK` action is dispatched. Or a root reducer should pass a `DELETE_FAVORITE` action to the favorites reducer when a `DELETE_BOOK` action is dispatched.

```js
import { bookReducer, DELETE_BOOK } from './book';
import { favoritesReducer, deleteFavorite } from './favorites';

function rootReducer (state = {}, action) {
	return {
		books: bookReducer(state.books, action)
		favorites: favoritesReducer(
			state.books,
			// if DELETE_BOOK is dispatched we pass a DELETE_FAVORITE action to the favorites reducer
			action.type === DELETE_BOOK
				? deleteFavorites(action.payload)
				: action
		)
	}
}
```

You can use a similar approach with `encaps`.
An object returned by the `build` function has the `subActions` method. It let you set additional actions which will be dispatched with an original action. This code dispatches a `DELETE_FAVORITE` action when a `DELETE_BOOK` action is dispatched.

```js
import { booksReducer, bookActions, DELETE_BOOK } from "./book";
import { favoritesReducer, favoritesActions } from "./favorites";
import { children } from "encaps";

const rootModel = children({
  books: { reducer: booksReducer, actions: booksActions },
  favorites: { reducer: favoritesReducer, actions: favoritesActions }
}).subActions((action, actions) => {
  switch (action.type) {
    /**
     * the deleteBook action creator must have a toString method which returns its action's type
     */
    case actions.books.deleteBook.toString():
      return actions.favorites.deleteFavorite(action.payload);
    default:
      return null;
  }
});
```

The `subActions` method accepts a `getSubActions` function which returns additional actions for a current action. The first agrument of `getSubActions` is the current action. The second argument is action creators of the current model. The `getSubActions` function can return a action, an array of actions or `null`.

The second way to use `subActions` is to pass an object. This object should have the same field names as this model's action creators. Values of the object's fields can be functions which returns additional actions. The functions have the same singnature as in the previous approach. This form of `subActions` has a limitation. It works only if action creators return an action with a type identical to action creator names.

This code is identical to the previous one.

```js
import { booksModel } from "./book";
import { favoritesModel } from "./favorites";
import { children } from "encaps";

const rootModel = children({
  books: booksModel,
  favorites: favoritesModel
}).subActions({
  books: {
    deleteBook: (action, actions) =>
      actions.favorites.deleteFavorite(action.payload)
  }
});
```

## Additional action creators and async actions

The `handlers` method creates action creators which return actions with fields `type` and `payload`. Sometimes you need additional logic in action creators or you need to return actions which are not plain objects.

To do that you can use the `actionCreators` method. It accepts a map of functions which return additional action creators. Such action creators can return any values.

This code generates a new action creators which returns an array of actions.

```js
const user = build()
	.initState(() => ({firstName: '', surName: ''}))
	.handlers({
		setFirstName: 'firstName',
		setSurName: 'surName',
	});
	.actionCreators({
		setFullName: () => (fullName) => [
			{type: 'setFirstName', payload: fullName.split(' ')[0]},
			{type: 'setSurName', payload: fullName.split(' ')[1]},
		]
	})

user.actions.setFullName('Bill White');
/*
[
	{type: 'setFirstName', payload: 'Bill']},
	{type: 'setSurName', payload: 'White'},
]
*/
```

Functions which return action creators have 2 parameters:

- `actions` - action creators of the current model
- `select` - function which select the current model's state from a root state

These parameters is useful because a model can be used as a child in several parent models.

```js
import { user } from './user';

// here the user's model is added as a 'user' field
const rootModel = children({user: user})

...

// and here - as 'adminUser'
const rootModel = children({adminUser: user})

...

// in the third place it can be added in two fields
const rootModel = children({
	adminUser: user,
	user: user,
})
```

If we leave the previous implementation of `setFullName` then it always will return actions with types `setFirstName`and `setSurName`. But in different places these types must have different prefixes.

The `actions` parameter is useful here.

```js
.actionCreators({
	setFullName: (actions, select) => (fullName) => [
		actions.setFirstName(fullName.split(' ')[0]),
		actions.setSurName(fullName.split(' ')[1]),
	]
})
```

Then `setFullName` will return correct types in every place.

```js
const rootModel = children({user: user})
rootModel.actions.user.setFullName('Bill White');
/*
[
	{type: 'user.setFirstName', payload: 'Bill']},
	{type: 'user.setSurName', payload: 'White'},
]
*/

...

const rootModel = children({adminUser: user})
rootModel.actions.user.setFullName('Bill White');
/*
[
	{type: 'adminUser.setFirstName', payload: 'Bill']},
	{type: 'adminUser.setSurName', payload: 'White'},
]
*/
```

The `select` parameter is useful when you need to receive a state of the current model from the root model.

## API

A reducer and its action creators is a core of reusable modules. Lets call such modules _models_.

```js
const someModel = {
  reducer: someReducer,
  actions: someActionCreators
};
```

`encaps` is designed to create such models.

`encaps` has the following functions:

- [build](#build)
- [children](#children)
- [createMap](#createmap)
- [createList](#createlist)
- [bindActionCreators](#bindactioncreators)

### build

The `build` function creates new models. It can be invoked without parameters or with an existed model as a parameter.

```js
import { build } from "encaps";

const model1 = build();
// or
const model2 = build({ reducer: someReducer, actions: someActionCreators });
```

`build` returns an object with the following methods and properties:

- [initState](#initstate)
- [handlers](#handlers)
- [children](#children)
- [subActions](#subactions)
- [actionCreators](#actioncreators)
- [wrap](#wrap)
- [model](#model)
- [reducer](#reducer)
- [actions](#actions)

All methods which change a model return a new independent object. Changes of this object don't affect the origin model.

#### initState

`initState` let you set an initial state of reducer. It has the only parameter - a `getInitState` function which returns a initial state.

```js
build().initState(() => ({ value: 0 }));
```

If an existed model was passed to `build` function then `getInitState` receives an initial state of the original model as a parameter.

```js
build({ reducer: someReducer, actions: someActions }).initState(state => ({
  ...state,
  name: ""
}));
```

#### handlers

This function creates handlers of actions and creators for these action. `handlers` receives a map of handlers. The field names of this map will be action types. For each action type will be created an action creators with the same name.
These action creators can receive a `payload` parameter.

```js
const model = build()
  .initState(() => ({ value: 0 }))
  .handlers({
    add: (state, action) => ({ value: state.value + action.payload })
  });

model.actions.add(10); // {type: 'add', payload: 10}
```

#### children

`children` add child models to the current model. It receives a map of child models.

```js
const parentModel = buld().children({
  child1: child1Model,
  child2: child2Model
});
```

Also one child can be added to a parent model with the `child` function. This code is the same as the previous.

```js
const parentModel = buld()
  .child("child1", child1Model)
  .child("child2", child2Model);
```

#### subActions

`subActions` let you set actions which should be dispatched together. You can dispatch actions of one child model when action of an other child model is dispatched.

`subActions` has 2 forms. It can recevied a function or a map of functions.

When you pass a function to `subAcions` this function receives 2 parameters:

- action - an original action
- actions - action creators of the current model

This function should return additional actions. It can return one action, an array of actions or null.

```js
model.subActions((action, actions) => {
  switch (action.type) {
    case actions.child1.someAction.toString():
      return actions.child2.anotherAction(action.payload);
    case actions.child2.anotherAction.toString():
      return actions.child1.someAction(action.payload);
    default:
      return null;
  }
});
```

When you pass a map of functions to `subActions`, these function should have the same signature as the function from the previous example. Field names of the map will be used as types of actions to which you want to add additional actions. The map can contain nested objects for actions of child models. This form of `subActions` works when a action type matches an action creator name as if you create action creators with the `handlers` method.

This code is the same as the previous one.

```js
model.subActions({
  child1: {
    someAction: (action, actions) =>
      actions.child2.anotherAction(action.payload)
  },
  child2: {
    anotherAction: (action, actions) =>
      actions.child1.someAction(action.payload)
  }
});
```

#### actionCreators

This method is used to generate action creators. These creators can return any values instead of plain objects. `actionCreators` receives a map of function. Each function has 2 parameters:

- actions - action creators of the current model
- select - a function to select a state of the current model from the root state

```js
model.actionCreators({
	thunk: (actions, select) => (payload) => (dispatch, rootState) => {
		const modelState = select(rootState);
		...
		dispatch(actions.someAction())
		...
	}
})
```

Alse you can set one action creator with this code:

```js
model.actionCreator(
	'thunk',
	(actions, select) => (payload) => (dispatch, rootState) => {
		const modelState = select(rootState);
		...
		dispatch(actions.someAction())
		...
	}
)
```

#### wrap

`wrap` is used to extend the current model. The `wrap` method has one parameter. It is a `wrapper` function. This function receives the current model and should return a new extended model.

```js
model.wrap(model =>
  model
    .initState(state => ({ ...state, title: "" }))
    .handlers({
      setTitle: "title"
    })
);
```

This code adds a new field `title` and action `setTitle` to the current model.

#### reducer

The `reducer` property contains the reducer of the current model.

#### actions

The `actions` property contains action creators of the current model.

#### model

The `model` property returns an object with `reducer` and `actions` fields.

### children

This function is used to join models. It has one parameter - a map of child models. `children` returns an object with methods to extends a parent model.

```js
import { children } from "encaps";
children({
  child1: childModel,
  anotherChild: child2Model
});
```

`children` is a short form of:

```js
build().children({
  child1: childModel,
  anotherChild: child2Model
});
```

### createList

This function creates a dynamic list of child models. See details [here](#createlist). `createList` returns an object with the same methods as in an object returned by the `build` function.

### createMap

This function creates a dynamic list of child models. It is similar to `createList` but `createMap` creates a map of child models instead of an array. See details [here](#createlist). `createMap` returns an object with the same methods as in an object returned by the `build` function.

### bindActionCreators

`encaps` has its own implementation of `bindActionCreators` function. It is similar to `bindActionCreators` from `redux` but it works correctly with nested action creators and action creator generators `item` used by dynamic lists of models.

```js
import { build, createList, bindActionCreators } from "encaps";

const child = build().handlers({ childAction: state => state });
const list = createList(child);
const parent = build().children({ list });

// this function returns a child model's action {type: 'list.item.13.childAction', payload: 12}
parent.actions.list.item(13).childAction(12);

const boundActions = bindActionCreators(parent.actions, dispatch);

// dispatching of a bound action
boundActions.list.item(13).childAction(12);
```

## Type checking with typescript

All code into `encaps` is covered by types. In the most cases there is no need to set types manually. There is 2 cases when you should do it.

One of them is a type of a reducer state. You can set a type of the state using the `initState` function. The type of reducer state can be determined automatically when `initState` return an object with fields whose types are monosemantic.

```js
const model = build().initState(() => ({ title: "", price: 0 }));
```

In this example the type of the state is `{title: string, price: number}`.

But if an initial state has optional fields you should specify a type manually.

```typescript
type State = {
  title: string;
  price?: object;
};

const model = build().initState<State>(() => ({ title: "" }));
```

The second place when you should specify a type manually is a type of action creator's `payload` parameter. You can do it this way.

```typescript
import { build, IAction } from "encaps";

const model = build()
  .initState(() => ({ title: "", count: 0 }))
  .handlers({
    add: (state, action: IAction<number>) => ({
      ...state,
      count: state.count + action.payload
    }),
    setTitle: (state, action: IAction<string>) => ({
      ...state,
      title: action.payload
    })
  });
```
