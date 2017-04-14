import * as React from "react";
import * as ECF from "encaps-component-factory";
import { IProps } from "./types";
import { IViewProps as ITodosViewProps } from "../../todoList/types";

import controller from "./controller";
import View from "./viewOptimized";

const TodosComponent = controller.getComponent(View);

export const COMPONENT_STATE = "component";
const StateHolder = ECF.getStateHolder();

const CompositeTodosView = (props: ITodosViewProps) => {
	return <StateHolder 
		code={COMPONENT_STATE}
		Element={TodosComponent}
		elementProps={{todos: props}}
	/>;
};

export default CompositeTodosView;
