import { favoritesDispatch, FAVORITES } from "../controller";
import favoritesController from "../../controllers/favorites";
import { connect } from "react-redux";
import * as React from "react";

export default function favoritesConnect(
	mapStateProps: (viewProps) => any = (viewProps) => viewProps,
	mapDispatchProps: (viewProps) => any = (viewProps) => viewProps,
): (component: React.ComponentClass<any> | React.StatelessComponent<any>) => React.ComponentClass<any> {
	return connect(
		(state, props) => mapStateProps(favoritesController.getStateToProps()(state[FAVORITES], props)),
		(dispatch, props) => mapDispatchProps(favoritesController.getDispatchToProps()(favoritesDispatch(dispatch), props))
	);
}