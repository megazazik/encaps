import * as React from "react";
import Favorite from '../inFavorite';
import favoritesConnect from "../../page/connect/favorites";
import { IViewProps as IFavoritesIViewProps } from "../../controllers/favorites/types";

export interface IProps {
	id: string
}

export interface IViewProps extends IFavoritesIViewProps, IProps {
	inFavorites: boolean;
}

class View extends React.Component<IViewProps, {}> {
	render () {
		const props = this.props;
		return (
			<Favorite
				inFavorites={props.inFavorites}
				onRemoveItem={() => props.onRemoveItem(props.id)}
				onAddItem={() => props.onAddItem(props.id)}
			/>
		);
	}
}

export const FavoriteComponent = favoritesConnect<IProps, any>(
	(componentProps, props) => ({
		onAddItem: componentProps.onAddItem,
		onRemoveItem: componentProps.onRemoveItem,
		id: props.id,
		inFavorites: componentProps.ids.indexOf(props.id) >= 0
	})
)(View);

export default FavoriteComponent;