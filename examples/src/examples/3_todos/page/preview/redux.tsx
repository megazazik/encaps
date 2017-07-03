import { createBuilder, wrapDispatch } from "encaps-component-factory/controller";
import { createComponent } from "encaps-component-factory/react";
import { IAction, ViewProps, Dispatch } from "encaps-component-factory/types";
import controller from "../controller";
import Component from "../view";
import withStore from "../../../redux";

export default withStore(controller.getReducer(), createComponent(controller)(Component));