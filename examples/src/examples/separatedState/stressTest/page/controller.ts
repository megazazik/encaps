import * as ECF from "encaps-component-factory";
import controller from "../../withInitialState/lazyTodoList/controller";
import { TODOS_STATE_ITEM_KEY } from "../../todoList/stateHolder";
import { FAVORITES_STATE_ITEM_KEY } from "../../favorites/stateHolder";
import { COMPONENT_STATE } from "../../withInitialState/lazyTodoList/stateHolder";
import todosController from "../../todoList/controller";
import { Status } from "../../todo/types";
import favoritesController from "../../favorites/controller";

interface IPageState {
	[key: string]: any
};

const pageBuilder = ECF.createBuilder<{}, IPageState, {}>();
pageBuilder.setInitState( () => {
	let todos = {};
	for(let i: number = 0; i < 1000; i++) {
		todos[i] = {
			title: "Это очень важное дело " + i,
			description: "Надо обязательно все сделать",
			status: Status.New,
			id: i
		};
	}

	return {
		[TODOS_STATE_ITEM_KEY]: { todos },
		[FAVORITES_STATE_ITEM_KEY]: { ids: ["6"]}
	};
});

pageBuilder.addBuilder(COMPONENT_STATE, controller);
pageBuilder.addBuilder(TODOS_STATE_ITEM_KEY, todosController);
pageBuilder.addBuilder(FAVORITES_STATE_ITEM_KEY, favoritesController);

export default pageBuilder.getController();