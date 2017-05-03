import * as React from "react";
import * as ECF from "encaps-component-factory";
import { IProps } from "./types";
import { IViewProps as ITodosViewProps } from "../todoList/types";
import TodosComponent from "./index";
import { connectByKey } from "../../redux";

export const COMPONENT_STATE = "component";

const ConnectedCompositeTodosView = connectByKey(COMPONENT_STATE)(TodosComponent);

const ConnectedCompositeTodosViewAdapter = (props: ITodosViewProps): JSX.Element => {
	return <ConnectedCompositeTodosView todos={props} />;
}

export default ConnectedCompositeTodosViewAdapter;