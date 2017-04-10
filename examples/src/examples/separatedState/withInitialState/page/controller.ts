import * as ECF from "encaps-component-factory";
import controller from  "../lazyTodoList/controller";
import { TODOS_STATE_ITEM_KEY } from "../../todoList/stateHolder";
import { FAVORITES_STATE_ITEM_KEY } from "../../favorites/stateHolder";
import { COMPONENT_STATE } from "../lazyTodoList/stateHolder";
import todosController from "../../todoList/controller";
import { Status } from "../../todo/types";
import favoritesController from "../../favorites/controller";

interface IPageState {
	[key: string]: any
};

const pageBuilder = ECF.createBuilder<{}, IPageState, {}>();
pageBuilder.setInitState( () => {
	return {
		[TODOS_STATE_ITEM_KEY]: { todos: {
			5: {
				title: "Это очень важное дело",
				description: "Надо обязательно все сделать",
				status: Status.InProgress,
				id: 5
			},
			6: {
				title: "Второе дело",
				description: "Не такое важное",
				status: Status.New,
				id: 6
			}
		}},
		[FAVORITES_STATE_ITEM_KEY]: { ids: ["6"]}
	};
});

pageBuilder.addBuilder(COMPONENT_STATE, controller);
pageBuilder.addBuilder(TODOS_STATE_ITEM_KEY, todosController);
pageBuilder.addBuilder(FAVORITES_STATE_ITEM_KEY, favoritesController);

export default pageBuilder.getController();