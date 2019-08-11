# encaps
`encaps` это библиотека для создания независимых, переиспользуемых и расширяемых модулей для приложений, логика работы которых основана на редьюсерах.  `encaps` можно использовать совместно с `redux` или с хуком `useReducer` из `react`.

# Повторное использование редьюсеров
Использование редьюсеров для описания логики приложения совместно с такой библиотекой как `redux` дает множество преимуществ. Но в некоторых случаях повторное использование этой логики становится проблематичным. Если мы хотим перенести один из редьюсеров и его генераторы действий (action creators) на другую страницу или в другой проект, у нас может возникнуть конфликт типов действий. Также мы не сможем без доработок использовать один и тот же редьюсер и его генераторы действий для управления несколькими частями состояния на одной странице.

Например, мы можем создать редьюсер и генераторы действий для управления состоянием счетчика:
```javascript
function counterReducer (state = 0, action) {
	switch (action.type) {
		case 'INCREMENT':
			return state + 1
		case 'DECREMENT':
			return state - 1
		default:
			return state
	}
}

function increment () {
	return {type: 'INCREMENT'};
}

function decrement () {
	return {type: 'DECREMENT'};
}
```
Если мы захотим отобразить на странице несколько счетчиков, мы может попробовать объединить их с помощью следующего кода:
```javascript
import { combineReducers } from 'redux'

const rootReducer = combineReducers({
	counterA: counterReducer,
	counterB: counterReducer,
	counterC: counterReducer
})
```
Но тогда любые действия с типом `INCREMENT` и `DECREMENT` будут изменять состояние всех трех счетчиков.

`encaps` помогает решить подобные проблемы.

## children
Для создания независимых экземпляров счетчика на странице можно использовать функцию `children`. Она похожа на `combineReducers`, но отличается тем, что принимает и возвращает не только редьюсеры, но еще и его генераторы действий.
```javascript
import { children } from 'encaps'

const counterActions = { increment, decrement };

const { reducer: rootReducer, actions: rootActions } = children({
	counterA: {reducer: counterReducer, actions: counterActions},
	counterB: {reducer: counterReducer, actions: counterActions},
	counterC: {reducer: counterReducer, actions: counterActions},
})
```
После этого `rootReducer` также как и в первом случае будет обрабатывать состояние, которое будет иметь следующий вид:
```javascript
{
	counterA: number,
	counterB: number,
	counterC: number,
}
```
А `rootActions` будет состоять из генераторов действий для каждого из трех независимых счетчиков.
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
Генераторы действий можно вызывать следующим образом:
```javascript
rootActions.counterA.increment(); // {type: 'counterA.INCREMETNT'}
rootActions.counterB.decrement(); // {type: 'counterB.DECREMETNT'}
```
Действия с префиксом `counterB`, будут влиять только на состояние счетчика `counterB`.

Для удобства можно объединить редьюсер и генераторы действий в один объект. Назовем его модель:
```javascript
const counterModel = {reducer: counterReducer, actions: {increment, decrement}}

const rootModel = children({
	counterA: counterModel,
	counterB: counterModel,
	counterC: counterModel,
})

rootModel.reducer(undefined, {type: 'init'})
/*
{
	counterA: 0,
	counterB: 0,
	counterC: 0,
}
*/

rootModel.actions.counterA.increment(); // {type: 'counterA.INCREMETNT'}
```

Уровень вложенности таких моделей не ограничен:
```javascript
// создаем модель счетчика
const counter = {reducer: counterReducer, actions: {increment, decrement}}

// создаем модель родительского элемента, состоящего из нескольких счетчиков
const parentModel = children({
	counter1: counter,
	counter2: counter,
})

// создаем корневую модель, состоящую из нескольких родительских моделей
const rootModel = children({
	parent1: parentModel,
	parent2: parentModel,
})

// состояние корневой модели
rootModel.reducer(undefined, {type: 'init'})
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
Иногда количество различных компонентов на странице определяется динамически. Тогда мы заранее не знаем, сколько нам потребуется счетчиков. В таких ситуациях будет полезна функция `createList`. С ее помощью можно динамически добавлять счетчики на страницу.
```javascript
import { createList } from 'encaps'
const counterModel = {reducer: counterReducer, actions: {increment, decrement}}

const counterList = createList(counterModel);
```
Состояние списка счетчиков будет иметь следующий вид:
```javascript
{items: [/* массив состояний счетчиков */]}
```
Для изменения состояния элемента списка нужно генерировать действия с определенным индексом:
```javascript
counterList.actions.item(1).increment(); // {type: 'item.1.INCREMENT'};
```
После обработки этих действий будет изменяться состояние только счетчика с соответствующим индексом. Если счетчика с таким индексом нет, то никаких изменений состояния не произойдет.
```javascript
counterList.reducer(
	{items: [0, 0]},
	counterList.actions.item(1).increment()
); // {items: [0, 1]} - изменился счетчик с индексом 1

counterList.reducer(
	{items: [0, 0]},
	counterList.actions.item(3).increment()
); // {items: [0, 0]} - счетчика и индексом 3 нет, поэтому состояние не изменилось
```
Для добавления и удаления элементов списка можно реализовать дополнительные действия. Это можно сделать следующим способом:
```javascript
// создаем новый тип действия для добавления элемента списка
function addItem () {
	return {type: 'ADD_ITEM'};
}

// создаем редьюсер, умеющий обрабатывать дополнительное действие ADD_ITEM
function listReducerWithAdditionalActions (state = {items: []}, action) {
	switch (action.type) {
		// добавляем элемент массива
		case 'ADD_ITEM':
			return {items: [...state.items, 0]};
		// передаем обработку редьюсеру списка
		default:
			return counterList.reducer(state, action);
	}
}

listReducerWithAdditionalActions(
	{items: [0, 0]},
	addItem()
); // {items: [0, 0, 0]}
```

Для простого добавления действий в список можно использовать функцию `handlers`, которая имеется в объекте, возвращаемом функцией `createList` (смотри подробности [здесь](#handlers)).
```javascript
const counterList = createList(counterModel)
	.handlers({
		addItem: (state, action) => ({items: [...state.items, 0]})
	});

counterList.actions.addItem(); //{type: 'addItem'}
```
С помощью функции `handlers` здесь дана возможность добавления счетчов в список, аналогично примеру выше. Функция `handlers` одновременно и создает генератор действий с типом `addItem`, и указывает функцию обработчик для данного типа действий.

Списки можно также добавлять в другие модели:
```javascript
const rootModel = children({
	counterA: counterModel,
	counterList: counterList
})
```
Состояние, которым управляет `rootReducer` будет иметь следующий вид:
```javascript
{
	counterA: number,
	counterList: {items: [...numbers]}
}
```
Действия списка корневой модели:
```javascript
rootModel.actions.counterList.item(2).increment(); // {type: 'counterList.item.2.INCREMENT'}
```

## createMap
Функция `createMap` аналогична `createList` за тем исключением, что она создает модель, которая работает с объектом, а не с массивом.
```javascript
import { createMap } from 'encaps'

const counterMap = createMap(counterModel);

counterMap.actions.item('counter1').increment(); // {type: 'item.counter1.INCREMENT'};

counterList.reducer(
	{items: {
		counter1: 0,
		counter2: 0,
	}},
	counterList.actions.item('counter1').increment()
); 
/*
{items: {
	counter1: 1,
	counter2: 0,
}}
*/
```

## Создание моделей (редьюсеров и генераторов действий)
`encaps` может работать с редьюсерами, написанными на чистом js, написанными с помощью вспомогательных библиотек (например, redux-actions), а также содержит собственные функции, которые упрощают создание редьюсеров и генераторов действий.

Для создания редьюсеров `encaps` содержит функцию `build`. Она возвращает объект с методами для создания обработчиков и генераторов действий.
```js
import { build } from 'encaps';

export const counterModel = build()
	// задачем начальное состояние счетчика
	.initState(() => ({value: 0}))
	// добавляем обработчики и генераторы действий
	.handlers({
		increment: (state, action) => ({...state, value: state.value + 1}),
		decrement: (state, action) => ({...state, value: state.value - 1}),
	});

// начальное состояние редьюсера будет результатом функции, переданной в initState
counterModel.reducer(undefined, {type: 'init'}); // {value: 0}

// будут созданы генераторы для действий increment и decrement
counterModel.actions.increment(); // {type: 'increment'}
counterModel.actions.decrement(); // {type: 'decrement'}

counterModel.reducer(
	{value: 3},
	counterModel.actions.decrement()
); // {value: 2}
```
Генераторы действий, созданные с помощью функции `handlers`, могут принимать параметр `payload`, который будет записан в объекта действия.
```js
counterModel.handlers({
	addMany: (state, action) => ({...state, value: state.value + action.payload})
})

counterModel.actions.addMany(10); // {type: 'addMany', payload: 10}

counterModel.reducer(
	{value: 3},
	counterModel.actions.addMany(10)
); // {value: 13}
```
Создание обработчика действия для простого изменения значения поля имеет короткую форму записи. Следующие 2 фрагмента кода дают одинаковый результат.
```js
counterModel.handlers({
	setValue: (state, action) => ({...state, value: action.payload})
})
// аналогично следующему
counterModel.handlers({
	setValue: 'value'
})
```

## Расширение функционала редьюсеров
Каждый метод объекта для создания редьюсеров возвращает новый независимый объект. Изменения в новом объекте не влияют на изначальную модель. Таким образом можно расширять имеющиеся модели, добавляя функциональность.
```js
const user = build()
	.initState(() => ({name: '', email: ''}))
	.handlers({
		setName: 'name',
		setEmail: 'email'
	});

// создаем модель пользователя с дополнительным полем 'phone'
const userWithPhone = user
	.initState((originalState) => ({...originalState, phone: ''}))
	.handlers({setPhone: 'phone'});

userWithPhone.reducer(undefined, {type: 'init'}); // {name: '', email: '', phone: ''}

// создаем модель пользователя с дополнительным полем 'login'
const userWithLogin = user
	.initState((originalState) => ({...originalState, login: ''}))
	.handlers({setLogin: 'login'});

userWithLogin.reducer(undefined, {type: 'init'}); // {name: '', email: '', login: ''}
```
Из модели пользователя можно создать несколько моделей, в которые можно независимо добавлять разные поля. При расширении функционала модели функция, которая передается в `initState`, будет принимаать первым параметром начальное состояние оригинальной модели.

## Обработка действий других редьюсеров
Основной идеей `encaps` является создание редьюсеров готовых к повторному использованию. Для этого отдельные модели должны быть максимально независимы друг от друга.

Рассмотрим пример.

Допустим, у нас на странице нужно хранить список книг с возможностью их создания, изменения и удаления.
```js
export const ADD_BOOK = 'ADD_BOOK';
export const DELETE_BOOK = 'DELETE_BOOK';
export const EDIT_BOOK = 'EDIT_BOOK';

const addBook = (payload) => ({type: ADD_BOOK, payload})
const deleteBook = (payload) => ({type: DELETE_BOOK, payload})
const editBook = (payload) => ({type: EDIT_BOOK, payload})

function booksReducer (state, action) {...}
```
Также у нас есть список "Избранное". В него можно добавлять и удалять книги.
```js
const addFavorite = (payload) => ({type: 'ADD_FAVORITE', payload})
const deleteFavorite = (payload) => ({type: 'DELETE_FAVORITE', payload})

function favoritesReducer (state, action) {...}
```
При этом, если мы удаляем книгу, мы должны ее удалить и из списка "Избранное". При обычном `redux` подходе редьюсер списка "Избранное" должен изменять свое состояние при вызове действия "Удалить книгу" списка книг.
```js
import { DELETE_BOOK } from './book';

function favoritesReducer (state, action) {
	switch (action.type) {
		...
		case DELETE_BOOK:
			// удаление из избранного
		case ...
	}
}
```
Получается, редьюсер, отвечающий за "Избранное", будет зависеть от соседнего модуля и его нельзя будет без изменения повторно использовать на другой странице, например, для хранения избранных музыкальных альбомов.

Чтобы убрать такую зависимость, список "Избранного" не должен реагировать на действия списка книг. Вместо этого можно написать мидлвару, которая будет вызывать функцию `dispatch` с действием `DELETE_FAVORITE` каждый раз, когда происходит действие `DELETE_BOOK`. Или  в родительском редьюсере при обработке действия `DELETE_BOOK` можно в редьюсер "Избранного" передавать действие `DELETE_FAVORITE` с помощью подобного кода.
```js
import { bookReducer, DELETE_BOOK } from './book';
import { favoritesReducer, deleteFavorite } from './favorites';

// редьюсер состояния всей страницы
function rootReducer (state = {}, action) {
	return {
		books: bookReducer(state.books, action)
		favorites: favoritesReducer(
			state.books,
			// при обработке действия DELETE_BOOK передаем в favoriteReducer действие для удаления элемента из избранного
			action.type === DELETE_BOOK
				? deleteFavorites(action.payload)
				: action
		)
	}
}
```
Подобный подход используется в `encaps` для обработки действий соседних редьюсеров.
Объект для построения редьюсеров содержит метод `subActions`. Он позволят для любого действия модели указать дополнительные действия, которые должны быть выполнены при обработке исходного действия. Вот так можно добавить удаление записи из списка "Избранное" при удалении книги.
```js
import { booksReducer, bookActions, DELETE_BOOK } from './book';
import { favoritesReducer, favoritesActions } from './favorites';
import { children } from 'encaps';

const rootModel = children({
	books: {reducer: booksReducer, actions: booksActions},
	favorites: {reducer: favoritesReducer, actions: favoritesActions}
})
.subActions((action, actions) => {
	switch (action.type) {
		/**
		 * для корректной работы необходимо, чтобы генератор действия deleteBook имел собственный метод toString,
		 * который должен возвращать тип действия
		 */
		case actions.books.deleteBook.toString():
			return actions.favorites.deleteFavorite(action.payload);
		default:
			return null;
	}
})
```
Метод `subActions` принимает функцию, которая первым аргументов принимает текущее действие, к которому надо добавить связанные дейтсвия. Второй аргумент - это генераторы действий текущей модели. Их можно использовать как для проверки типа текущего действия, так и для генерации новых действий. Данная функция должна вернуть новое действиe, массив действий или `null`.

Также функция `subActions` может принимать в качестве параметра объект, поля которого соответствуют полям объекта с генераторами действий текущей модели. А значениями объекта будет функции, которые возвращают дополнительные действия для соответствующего генератора действий. Интерфейс функции такой же как у функции, передаваемой в `subActions`. Но чтобы этот способ работал, нужно чтобы имена генераторов действия совпадали с типом действий, которые эти генераторы возвращают, как это происходит при создании моделей с помощью функции `build`.

Пример выше можно переписать следующим образом:
```js
import { booksModel } from './book';
import { favoritesModel } from './favorites';
import { children } from 'encaps';

const rootModel = children({
	books: booksModel,
	favorites: favoritesModel
})
.subActions({
	books: {
		deleteBook: (action, actions) => actions.favorites.deleteFavorite(action.payload)
	}
})
```

## Собственные генераторы действий и работа с асинхронными действиями
Функция `handlers` создает генераторы действий, которые возвращают объекты с полями `type` и `payload` для каждого типа действия, обрабатываемого редьюсером. Иногда таких генераторов действий недостаточно. Может понадобиться реализовать в генераторах какую-то дополнительную логику или возвращать из генераторов не объекты, а массивы, промисы или функции в зависимости от используемых в `redux` промежуточных обработчиков.

Для таких случаев в объекте для построения редьюсеров есть метод `actionCreators`. Он принимает объект с функциями, которые возвращают дополнительные генераторы действий. 

Этот код создает генератор, который возвращает массив действий.
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

Такие генераторы могут возвращать любые значения.

Функции, создающие генераторы, принимают 2 параметра:
* `actions` - генераторы действия данной модели
* `select` - функцию, которая выбирает состояние текущей модели из корневого состояния

Эти параметры нужны из-за того, что при создании генератора действия, мы не можем точно знать, где и как будет применяться данный редьюсер.
```js
import { user } from './user';

// в одном месте модель может быть добавлена в корневую модель в поле user
const rootModel = children({user: user}) 

...

// в другом в поле adminUser
const rootModel = children({adminUser: user})

...

// в третьем модель пользователя может управлять 2-мя полями
const rootModel = children({
	adminUser: user,
	user: user,
})
```
Если оставить реализацию `setFullName`, как в примере выше, то для каждого такого случая эта функция будет возвращать дейтсвия с одинакомыми типами `setFirstName` и `setSurName`. Эти действия не будут работать, как ожидается, так как для каждого случая у действий должен быть свой уникальный префикс.
С помощью параметра `actions` можно переписать `setFullName` так:
```js
.actionCreators({
	setFullName: (actions, select) => (fullName) => [
		actions.setFirstName(fullName.split(' ')[0]),
		actions.setSurName(fullName.split(' ')[1]),
	]
})
```
Тогда в разных местах этот генератор будет возвращать действия с правильным типом.
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

Второй параметр `select` функции, создающей генераторы действий, может потребоваться, когда при создании действия нужно получить состояние текущей модели. Такой прием будет полезен, например, при использовании библиотеки `redux-thunk`, когда генератор действия возвращает функцию, принимающую `dispatch` и `state`. `state` в данном случае будет содержать состояние всей страницы. Выбрать состояние только текущего компонента поможет функция `select`.

## API
Для создания независимых модулей, описывающих логику в помощью редьюсеров, в первую очередь нужно создать собственно редьюсер и генераторы действий, которые этот редьюсер обрабатывает. Пусть объект, который объединяет генераторы действий и редьюсер, называется модель.
```js
const someModel = {
	reducer: someReducer,
	actions: someActionCreators,
}
```
Большая часть операций, для которых предназначен `encaps`, выполняются именно над такими моделями.

Основные методы `encaps` это:
 * [build](#build)
 * [children](#children)
 * [createMap](#createmap)
 * [createList](#createlist)
 * [bindActionCreators](#bindactioncreators)

### build
Основная функция для построения моделей это `build`. Ее можно использовать, чтобы создать модель с нуля или передать в нее уже существующую модель.
```js
import { build } from 'encaps';

const model1 = build();
// или 
const model2 = build({reducer: someReducer, actions: someActionCreators})
```

Это функция возвращает объект для построения моделей, содержащий следующие методы и свойства:
 * [initState](#initstate)
 * [handlers](#handlers)
 * [children](#children)
 * [subActions](#subactions)
 * [actionCreators](#actioncreators)
 * [wrap](#wrap)
 * [model](#model)
 * [reducer](#reducer)
 * [actions](#actions)

Все методы, добавляющие новый функционал в модель, возвращают новый объект, изменения в котором не влияют на исходную модель.

#### initState
`initState` позволяет задать начальное состояние для редьюсера. В качестве параметра принимает функцию `getInitState`, которая возвращает состояния.
```js
build().initState(() => ({value: 0}));
// здесь начальным состоянием будет объект {value: 0}
```
В случае, если в `build` был передан существующий редьюсер, то `getInitState` может принимать параметром начальное состояние переданного редьюсера. Тогда начальное состояние можно расширить, добавив в него поля.
```js
build({reducer: someReducer, actions: someActions})
	.initState((state) => ({...state, name: ''}))
```

#### handlers
Эта функция создает обработчики и генераторы действий. Она принимает объект, имена полей которого будут типами действий, а значения - обработчиками действий этого типа.
Для всех типов действий создается генератор, который может принимать один параметр. Этот параметр будет записан в поле `payload` действия.
```js
const model = build()
	.initState(() => ({value: 0}))
	.handlers({
		add: (state, action) => ({value: state.value + action.payload})
	});

model.actions.add(10); // {type: 'add', payload: 10}
```

#### children
Функция добавляет дочерние модели в текущую модель.
Она принимает объект с полями, значения которых являются дочерние модели.
```js
const parentModel = buld()
	.children({
		child1: child1Model,
		child2: child2Model,
	})
```
Для добавления дочерних моделей также можно использовать метод `child`. Он позволяет добавить только одну дочернюю модель. Следующий код дает такой же результат, что и код выше.
```js
const parentModel = buld()
	.child('child1', child1Model)
	.child('child2', child2Model)
```

#### subActions
Метод позволяет задать действия, которые должны выполняться совместно. С его помощью можно указать, что при выполнении какого-либо действия одной дочерней модели должны быть выполнены определенные действия другой модели.

Метод имеет 2 формы вызова с разными параметрами. В одном случае она принимает функцию, в другом объект.

При вызове метода `subActions` с функцией в качестве аргумента, в эту функцию будут переданы 2 параметра:
* action - действие, к которому нужно добавить дополнительный действия
* actions - генераторы действий текущей модели

Передаваемая в `subActions` функция может возвращать действие, массив действий или `null`;
```js
model.subActions(
	(action, actions) => {
		switch (action.type) {
			case actions.child1.someAction.toString():
				return actions.child2.anotherAction(action.payload);
			case actions.child2.anotherAction.toString():
				return actions.child1.someAction(action.payload);
			default:
				return null;
		}
	}
)
```

При использовании второй формы записи в `subActions` нужно передавать объект, полями которого будут являться типы действий, а значениями - функции, возвращающие дополнительные действия. Эти функции имеют такой же интерфейс, как функция, передаваемая в `subActions` в первом случае. Объект, передаваемый в `subActions` может содержить вложенные объекты для действий дочерних моделей. Вторая форма записи работает только, когда названия генераторов действий совпадает с типом действий, как при создании их функцией `handlers`.

Пример выше можно переписать следующим образом.
```js
model.subActions({
	child1: {
		someAction: (action, actions) => actions.child2.anotherAction(action.payload)
	},
	child2: {
		anotherAction: (action, actions) => actions.child1.someAction(action.payload)
	},
})
```

#### actionCreators
Метод служит для создания дополнительных генераторов действий. Такие генераторы действий могут возвращать не только объекты, а еще массимы, промисы, функции и т.п. Метод `actionCreators` принимает объект с функциями, возвращающими генераторы действия. Эти функции получают 2 параметра:
* actions - генераторы действий текущей модели
* select - функция, которая принимает состояние всей стрницы, а возвращает состояние текущей модели
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
Также есть возможность задавать дополнительные генераторы действий по одному следующим способом:
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
Метод `wrap` служит для удобного расширения функционала текущей модели. Он принимает в качестве параметра функцию `wrapper`, которая добавляет в текущую модель новый функционал. `wrapper` принимает текущую модель и возвращает новую расширенную модуль.
```js
model.wrap(
	(model) => model
		.initState((state) => ({...state, title: ''}))
		.handlers({
			setTitle: 'title'
		})
)
```
Этот код добавляет к текущей модели поле `title` и действие `setTitle`.

#### reducer
Свойство `reducer` содержит редьюсер данной модели.

#### actions
Свойство `actions` содержит генераторы действий данной модели.

#### model
Свойство `model` возвращает объект, состоящий из двух полей `reducer` и `actions` текущей модели.

### children
Функция служит для объединения независимых моделей. Она принимает объект с дочерними моделями и возвращает модель с дополнительными методами для ее расширения.
```js
import { children } from 'encaps';
children({
	child1: childModel,
	anotherChild: child2Model,
})
```
Фактически это короткая форма записи для:
```js
build().children({
	child1: childModel,
	anotherChild: child2Model,
})
```

### createList
Функция создает модель с динамическим списком дочерних моделей. Подробнее смотри [здесь](#createlist). В объекте, который возвращает функция `createList` имеются те же самые методы для расширения моделей, что в объекте, возвращаемом функцией `build`.

### createMap
Функция создает модель с динамическим списком дочерних моделей. Работа функции очень похожа на `createList` за тем исключением, что список дочерних моделей представляет собой не массив, а объект. Подробнее смотри [здесь](#createlist). В объекте, который возвращает функция `createMap` имеются те же самые методы для расширения моделей, что в объекте, возвращаемом функцией `build`.

### bindActionCreators
`encaps` имеет свою реализацию метода `bindActionCreators`. Подобно одноименной функции из `redux` она принимает объект генераторов действий и функцию `dispatch`, а возвращает объект с функциями, которые эти действия вызывают. Реализация в `encaps` отличается тем, что умеет правильно работать с генераторами действий, содержащими вложенные объекты для дейтсвий дочерних моделей, а также правильно работать с функциями `item`, предназначенными для создания действий диначических списков моделей.
```js
import { build, createList, bindActionCreators} from 'encaps';

const child = build().handlers({childAction: (state) => state});
const list = createList(child);
const parent = build().children({list});

// эта функция возвращает действие дочерней модели {type: 'list.item.13.childAction', payload: 12}
parent.actions.list.item(13).childAction(12);

const boundActions = bindActionCreators(parent.actions, dispatch);

// вызов привязанного действия
boundActions.list.item(13).childAction(12);
```

## Типизация с typescript
Весь код `encaps` покрыт типами с помощью `typescript`. В большинстве случаев все типы определяются автоматически, и нет необходимости указывать их вручную. Есть 2 случая, когда указывать тип нужно.

Один из них связан с состоянием, с которым работает редьюсер модели. Тип состояния можно задать при вызове метода `initState`. В некоторых случаях он может определиться автоматически. Это произойдет тогда, когда начальное состояние будет содержать все необходимые поля с однозначным соответствием типов.
```js
const model = build()
	.initState(() => ({title: '', price: 0}))
```
В данном случае тип состояния редьюсера определится автоматически как `{title: string, price: number}`.

Но если тип состояния будет содержать необязательные поля, которые будут отсутствовать в начальном состоянии, то тип нужно указывать вручную.
```typescript
type State = {
	title: string;
	price?: object;
}

const model = build()
	.initState<State>(() => ({title: ''}))
```

Вторым случаем, когда тип необходимо указать вручную, является указание типа поля `payload` у создаваемых генераторов действий. Это можно сделать следующим образом:
```typescript
import { build, IAction } from 'encaps';

const model = build()
	.initState(() => ({title: '', count: 0}))
	.handlers({
		add: (state, action: IAction<number>) => ({...state, count: state.count + action.payload}),
		setTitle: (state, action: IAction<string>) => ({...state, title: action.payload}),
	})
```
