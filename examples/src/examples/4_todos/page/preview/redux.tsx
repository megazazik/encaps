import * as React from "react";
import * as ECF from "encaps-component-factory";
import controller from "../controller";
import Component from "../view";
import withStore from "../../../redux";

export default withStore(controller.getReducer(), controller.getComponent(Component));