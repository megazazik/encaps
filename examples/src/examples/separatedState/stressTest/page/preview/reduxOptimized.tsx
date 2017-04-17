import * as React from "react";
import * as ECF from "encaps-component-factory";
import View from "../viewOptimized";
import pageController from "../controller";
import withStore from "../../../../store";
// import withStore from "../../../../redux";
// import ReduxStateHolder from "encaps-component-factory-redux";
// ECF.setStateHolder(ReduxStateHolder);

const TodoWithSeparatedState = withStore(pageController.getReducer(), null, pageController.getComponent(View));

export default TodoWithSeparatedState;