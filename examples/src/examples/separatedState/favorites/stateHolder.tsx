import * as React from "react";
import * as ECF from "encaps-component-factory";
import Dispatcher from "../events";
import { IProps as IFavoritesProps, IState } from "./types";
import { connectByKey } from "../../redux";

interface IProps<P> {
	Element: React.ComponentClass<P & ECF.IChildProps<IState>> | React.SFC<P & ECF.IChildProps<IState>>;
	elementProps: P;
	favoritesProps?: IFavoritesProps;
}

export const FAVORITES_STATE_ITEM_KEY = "favorites";

class FavoritesStateHolder extends React.Component<IProps<any>, {}> {
	private static readonly addItemDispatcher = new Dispatcher();
	private static readonly removeItemDispatcher = new Dispatcher();

	private static onAddItem(id: string): void { FavoritesStateHolder.addItemDispatcher.notifyAll(id) };
	private static onRemoveItem(id: string): void { FavoritesStateHolder.removeItemDispatcher.notifyAll(id) };

	private onAddItem: (id: string) => void;
	private onRemoveItem: (id: string) => void;

	private ComponentStateHolder: React.StatelessComponent<any>;

	constructor (props) {
		super(props);

		this.setHandlers(this.props.favoritesProps);
		this.ComponentStateHolder = connectByKey(FAVORITES_STATE_ITEM_KEY)(this.props.Element);
	}

	private setHandlers(handlers: IFavoritesProps = {}): void {
		if (this.onAddItem != handlers.onAddItem) {
			FavoritesStateHolder.addItemDispatcher.remove(this.onAddItem);
			FavoritesStateHolder.addItemDispatcher.add(handlers.onAddItem);
			this.onAddItem = handlers.onAddItem;
		}

		if (this.onRemoveItem != handlers.onRemoveItem) {
			FavoritesStateHolder.removeItemDispatcher.remove(this.onRemoveItem);
			FavoritesStateHolder.removeItemDispatcher.add(handlers.onRemoveItem);
			this.onRemoveItem = handlers.onRemoveItem;
		}
	}

	componentWillReceiveProps (nextProps: IProps<any>): void {
		this.setHandlers(nextProps && nextProps.favoritesProps);
	}

	componentWillUnmount(): void {
		this.setHandlers();
	}

	render () {
		const elementProps = {
			...this.props.elementProps,
			onAddItem: FavoritesStateHolder.onAddItem,
			onRemoveItem: FavoritesStateHolder.onRemoveItem
		}
		
		return React.createElement(this.ComponentStateHolder, elementProps);
	}
}

// TODO придумать объявление, при котором при передаче null проверка на IState оставалась
export default function getTodosHolder<P> (
	Element: React.ComponentClass<P & ECF.IChildProps<IState>> | React.SFC<P & ECF.IChildProps<IState>>,
	elementProps: P,
	favoritesProps: IFavoritesProps = {}
): JSX.Element {
	return (
		<FavoritesStateHolder 
			Element={Element}
			elementProps={elementProps}
			favoritesProps={favoritesProps}
		/>
	);
}