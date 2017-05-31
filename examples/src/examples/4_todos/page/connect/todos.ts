import { todosDispatch, TODOS } from "../controller";
import todosController from "../../controllers/todoList";
import { connect } from "react-redux";
import * as React from "react";

export default function todosConnect(
	mapStateProps: (viewProps) => any = (viewProps) => viewProps,
	mapDispatchProps: (viewProps) => any = (viewProps) => viewProps,
): (component: React.ComponentClass<any> | React.StatelessComponent<any>) => React.ComponentClass<any> {
	return connect(
		(state, props) => mapStateProps(todosController.getStateToProps()(state[TODOS], props)),
		(dispatch, props) => mapDispatchProps(todosController.getDispatchToProps()(todosDispatch(dispatch), props))
	);
}