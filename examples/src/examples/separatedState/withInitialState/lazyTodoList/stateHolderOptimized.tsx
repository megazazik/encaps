import * as React from "react";
import * as ECF from "encaps-component-factory";
import { IProps } from "./types";
import { IViewProps as ITodosViewProps } from "../../todoList/types";
import { connect } from "../../../store";

import controller from "./controller";
import View from "./viewOptimized";

const TodosComponent = controller.getComponent(View);

export const COMPONENT_STATE = "component";

const ConnectedCompositeTodosView = connect(COMPONENT_STATE)(TodosComponent);

const ConnectedCompositeTodosViewAdapter = (props: ITodosViewProps): JSX.Element => {
	return <ConnectedCompositeTodosView todos={props} />;
}

export default ConnectedCompositeTodosViewAdapter;
