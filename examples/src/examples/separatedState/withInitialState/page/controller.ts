import * as ECF from "encaps-component-factory";
import controller from  "../lazyTodoList/controller";
import { TODOS_STATE_ITEM_KEY } from "../../todoList/stateHolder";
import { FAVORITES_STATE_ITEM_KEY } from "../../favorites/stateHolder";
import { COMPONENT_STATE } from "../lazyTodoList/stateHolder";
import todoListParentController from "../../todoList/controller";
import { Status } from "../../todo/types";
import favoritesParentController from "../../favorites/controller";

interface IPageState {
	[key: string]: any
};

const favoritesController = favoritesParentController.cloneWithInitState(() => ({ ids: ["5"]}));

const todosController = todoListParentController.cloneWithInitState(() => ({ todos: {
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
}}));

const pageController = ECF.createBuilder<{}, IPageState, {}>();
pageController.addBuilder(COMPONENT_STATE, controller);
pageController.addBuilder(TODOS_STATE_ITEM_KEY, todosController);
pageController.addBuilder(FAVORITES_STATE_ITEM_KEY, favoritesController);

export default pageController;