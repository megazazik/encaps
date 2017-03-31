import * as React from "react";
import { IViewProps, IProps } from "../favorites/types";
import controller from "../favorites/controller";
import getStateHolder from "../favorites/stateHolder";

function View (props: IViewProps & {id: string}): JSX.Element {
	const inFavorites = props.ids.indexOf(props.id) >= 0;
	return (
		<div
			onClick={ () => inFavorites ? props.onRemoveItem(props.id) : props.onAddItem(props.id) }
		>
			{ inFavorites ? 'Remove from favorites' : 'Add to favorites' }
		</div>
	);
}

const FavoriteComponent = controller.getComponent(View, (props: {id: string}) => ({id: props.id}));

const FavoriteWithStateComponent = (props: {id: string}): JSX.Element => {
	return getStateHolder(FavoriteComponent, props)
}

export default FavoriteWithStateComponent;