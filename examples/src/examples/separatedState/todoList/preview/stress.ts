import controller from "../controller";
import View from "../view";
import withStore from "../../../redux";
import { Status } from "../../todo/types";

const controllerReducer = controller.getReducer();

const initState = (): any => {
	let todos = {};
	for (let i: number = 0; i < 1000; i++) {
		todos[i] = {
			title: "Это очень важное дело " + i,
			description: "Надо обязательно все сделать",
			status: Status.New,
			id: i
		};
	}
	return { todos };
};


const reducer = (state = initState(), action) => {
	return controllerReducer(state, action);
}

export default withStore(reducer, null, controller.getComponent(View));