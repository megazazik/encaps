import * as React from "react";
import * as ECF from "encaps-component-factory";
import ReduxStateHolder from "encaps-component-factory-redux";
import withStore from "../../../../store";
// import withStore from "../../../../redux";
import View from "../viewOptimized";
import pageController from "../controller";

const TodoWithSeparatedState = withStore(pageController.getReducer(), null, pageController.getComponent(View));

// ECF.setStateHolder(ReduxStateHolder);

export default TodoWithSeparatedState;