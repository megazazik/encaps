import controller, { FAVORITES } from "../controller";
import * as React from "react";
import connect from "encaps-component-factory-redux";

export default function favoritesConnect(
	mapStateProps: (state, props?) => any = (s, p) => s,
	mapDispatchProps: (dispatch, props?) => any = (d, p) => d,
) {
	return connect({
		stateToProps: mapStateProps,
		dispatchToProps: mapDispatchProps,
		controller,
		path: FAVORITES,
		noConvertToComponentProps: true
	});
}