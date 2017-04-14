import * as React from "react";
import { IViewProps, IProps } from "../favorites/types";
import controller from "../favorites/controller";
import getStateHolder from "../favorites/stateHolder";

class View extends React.Component<IViewProps & {id: string}, {}>{
	shouldComponentUpdate (nextProps: IViewProps & {id: string}): boolean {
		return this.props.ids != nextProps.ids && (this.props.ids.indexOf(this.props.id) >= 0) != (nextProps.ids.indexOf(nextProps.id) >= 0);
	}

	private count = 0;

	render () {
		const inFavorites = this.props.ids.indexOf(this.props.id) >= 0;
		this.count++;
		return (
			<div
				onClick={ () => inFavorites ? this.props.onRemoveItem(this.props.id) : this.props.onAddItem(this.props.id) }
			>
				{ (inFavorites ? 'Remove from favorites' : 'Add to favorites') + " " + this.count }
			</div>
		);
	}
} 	

const FavoriteComponent = controller.getComponent(View, (props: {id: string}) => ({id: props.id}));

const FavoriteWithStateComponent = (props: {id: string}): JSX.Element => {
	return getStateHolder(FavoriteComponent, props)
}

export default FavoriteWithStateComponent;