import * as React from "react";
import { getStateHolder } from "../../../storage";

export const FAVORITES_STATE_ITEM_KEY = "favorites";
const StateHolder = getStateHolder();

export default function getFavoritesHolder<P> (
	Element: React.ComponentClass<P> | React.SFC<P>,
	elementProps: P
): JSX.Element {
	return (
		<StateHolder
			code={FAVORITES_STATE_ITEM_KEY}
			Element={Element}
			elementProps={elementProps}
		/>
	);
}