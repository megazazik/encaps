import * as React from "react";

interface IInFavoritesProps {
	inFavorites: boolean;
	onRemoveItem: () => void;
	onAddItem: () => void;
}

class InFavoritesComponent extends React.PureComponent<IInFavoritesProps, {}>{
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

export default InFavoritesComponent;