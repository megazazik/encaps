import { createBuilder, wrapDispatch } from "encaps/controller";
import { createComponent } from "encaps/react";
import { IAction, ViewProps, Dispatch } from "encaps/types";
import controller, { connect } from "../controller";
import Component from "../view";
import withStore from "../../../redux";

export default withStore(
	controller.getReducer(),
	connect(Component)
);