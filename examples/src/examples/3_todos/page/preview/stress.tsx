import * as React from "react";
import * as ECF from "encaps-component-factory";
import controller, { IState, connect } from "../controller";
import Component from "../view";
import withStore from "../../../redux";
import { Status } from "../../controllers/todo/types";

const TODOS_COUNT = 500;

const todos = {};
for(let i: number = 0; i < TODOS_COUNT; i++) {
	todos[i] = {
		title: "Это очень важное дело " + i,
		description: "Надо обязательно все сделать",
		status: Status.New,
		id: i
	};
}

const initState: IState = {
	...controller.getInitState(),
	todos: {
		todos,
		newTodoId: TODOS_COUNT + 1
	},
	favorites: {
		ids: ["0", "1", "2"]
	}
};

const reducer = (state = initState, action: ECF.IAction<any>) => controller.getReducer()(state, action);

export default withStore(reducer, connect(Component));