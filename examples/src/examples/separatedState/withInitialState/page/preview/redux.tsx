import * as React from "react";
import * as ECF from "encaps-component-factory";
import withStore from "../../../../redux";
import View from "../view";
import pageController from "../controller";

const TodoWithSeparatedState = withStore(pageController.getReducer(), pageController.getComponent(View));

export default TodoWithSeparatedState;