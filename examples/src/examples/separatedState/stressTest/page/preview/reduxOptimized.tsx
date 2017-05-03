import withStore from "../../../../redux";
import * as React from "react";
import * as ECF from "encaps-component-factory";
import View from "../viewOptimized";
import pageController from "../controller";

const TodoWithSeparatedState = withStore(pageController.getReducer(), pageController.getComponent(View));

export default TodoWithSeparatedState;