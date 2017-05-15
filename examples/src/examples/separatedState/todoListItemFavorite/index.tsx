import * as React from "react";
import { IViewProps, IProps } from "../favorites/types";
import controller from "../favorites/controller";
import { FAVORITES_STATE_ITEM_KEY } from "../favorites/stateHolder";
import { connectReduxByKey } from "../../redux";

interface IConnectedElementViewProps {
	inFavorites: boolean;
	onRemoveItem: () => void;
	onAddItem: () => void;
}

class ConnectedElementView extends React.PureComponent<IConnectedElementViewProps, {}>{
	render () {
		return (
			<div
				onClick={ () => this.props.inFavorites ? this.props.onRemoveItem() : this.props.onAddItem() }
			>
				{ (this.props.inFavorites ? 'Remove from favorites' : 'Add to favorites') }
			</div>
		);
	}
}

const falseValue = {inFavorites: false};
const trueValue = {inFavorites: true};

const ConnectedFavoriteComponent = connectReduxByKey(
	FAVORITES_STATE_ITEM_KEY,
	(state, props) => {
		const fullProps = controller.getStateToProps()(state, props);
		return fullProps.ids.indexOf(props.id) >= 0 ? trueValue : falseValue;
	},
	(dispatch, props) => {
		const fullProps = controller.getDispatchToProps()(dispatch, props);
		return {
			onRemoveItem: () => fullProps.onRemoveItem(props.id),
			onAddItem: () => fullProps.onAddItem(props.id)
		};
	}
)(ConnectedElementView);

export default ConnectedFavoriteComponent;