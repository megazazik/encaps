import * as React from "react";
import { getStateHolder } from "../../../storage";
import { IChildProps } from "../../../action";

interface IProps<P> {
	Element: React.ComponentClass<P & IChildProps> | React.SFC<P & IChildProps>,
	elementProps: P & IChildProps
}

export const TODOS_STATE_ITEM_KEY = "todos";
const StateHolder = getStateHolder();

export default function getTodosHolder<P> (
	Element: React.ComponentClass<P & IChildProps> | React.SFC<P & IChildProps>,
	elementProps: P & IChildProps
): JSX.Element {
	return (
		<StateHolder 
			code={TODOS_STATE_ITEM_KEY}
			Element={Element}
			elementProps={elementProps}
		/>
	);
}