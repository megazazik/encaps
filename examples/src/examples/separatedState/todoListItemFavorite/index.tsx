import * as React from "react";
import { IViewProps, IProps } from "../favorites/types";
import controller from "../favorites/controller";
import getStateHolder from "../favorites/stateHolder";
import { connectByKey } from "../../redux";

class View extends React.PureComponent<IViewProps & {id: string}, {}>{
	private inFavorites: boolean;

	private getValue (props: IViewProps & {id: string}): boolean {
		return props.ids.indexOf(props.id) >= 0;
	}

	shouldComponentUpdate (nextProps: IViewProps & {id: string}): boolean {
		return nextProps.id != this.props.id || this.getValue(nextProps) != this.inFavorites;
	}

	render () {
		this.inFavorites = this.getValue(this.props);
		const { ids, ...props} = this.props;
		return (
			<ElementView
				{...props}
				inFavorites={this.inFavorites}
			 />
		);
	}
}

interface IElementViewProps {
	id: string;
	inFavorites: boolean;
	onRemoveItem: (id: string) => void;
	onAddItem: (id: string) => void;
}

class ElementView extends React.Component<IElementViewProps, {}>{
	private count = 0;

	render () {
		this.count++;
		return (
			<div
				onClick={ () => this.props.inFavorites ? this.props.onRemoveItem(this.props.id) : this.props.onAddItem(this.props.id) }
			>
				{ (this.props.inFavorites ? 'Remove from favorites' : 'Add to favorites') + " " + this.count }
			</div>
		);
	}
}

const FavoriteComponent = controller.getComponent(View, (props: {id: string}) => ({id: props.id}));

const FavoriteWithStateComponent = (props: {id: string}): JSX.Element => {
	return getStateHolder(FavoriteComponent, props)
}

export default FavoriteWithStateComponent;