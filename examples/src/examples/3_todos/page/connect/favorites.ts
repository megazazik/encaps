import controller, { FAVORITES } from "../controller";
import { connectParams } from "../../controllers/favorites";
import { IViewProps } from "../../controllers/favorites/types";
import * as React from "react";
import { connectView } from "encaps-component-factory-redux";

export default function favoritesConnect<P = {}, VP = IViewProps>(
	mapProps?: (componentProps: IViewProps, props?: P) => VP
) {
	const mapPropsP: any = mapProps;
	const connect = connectView({
		...connectParams,
		mergeProps: mapPropsP ? (s, d, p) => mapPropsP(connectParams.mergeProps(s, d, p), p as any) : connectParams.mergeProps
	});

	return (component: React.ComponentType<VP>): React.StatelessComponent<P> => connect(component, FAVORITES);
}