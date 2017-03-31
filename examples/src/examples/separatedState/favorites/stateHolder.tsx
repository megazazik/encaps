import * as React from "react";
import * as ECF from "encaps-component-factory";
import Dispatcher from "../events";
import { IProps as IFavoritesProps } from "./types";

interface IProps<P> {
	Element: React.ComponentClass<P & ECF.IChildProps> | React.SFC<P & ECF.IChildProps>;
	elementProps: P & ECF.IChildProps;
	favoritesProps?: IFavoritesProps
}

export const FAVORITES_STATE_ITEM_KEY = "favorites";
const StateHolder = ECF.getStateHolder();

class TodoStateHolder extends React.Component<IProps<any>, {}> {
	private static readonly addItemDispatcher = new Dispatcher();
	private static readonly removeItemDispatcher = new Dispatcher();

	private static onAddItem(id: string): void { TodoStateHolder.addItemDispatcher.notifyAll(id) };
	private static onRemoveItem(id: string): void { TodoStateHolder.removeItemDispatcher.notifyAll(id) };

	private onAddItem: (id: string) => void;
	private onRemoveItem: (id: string) => void;

	constructor (props) {
		super(props);

		this.setHandlers(this.props.favoritesProps);
	}

	private setHandlers(handlers: IFavoritesProps = {}): void {
		if (this.onAddItem != handlers.onAddItem) {
			TodoStateHolder.addItemDispatcher.remove(this.onAddItem);
			TodoStateHolder.addItemDispatcher.add(handlers.onAddItem);
			this.onAddItem = handlers.onAddItem;
		}

		if (this.onRemoveItem != handlers.onRemoveItem) {
			TodoStateHolder.removeItemDispatcher.remove(this.onRemoveItem);
			TodoStateHolder.removeItemDispatcher.add(handlers.onRemoveItem);
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
			onAddItem: TodoStateHolder.onAddItem,
			onRemoveItem: TodoStateHolder.onRemoveItem
		}
		
		return <StateHolder 
			code={FAVORITES_STATE_ITEM_KEY}
			Element={this.props.Element}
			elementProps={elementProps}
		/>;
	}
}

export default function getTodosHolder<P> (
	Element: React.ComponentClass<P & ECF.IChildProps> | React.SFC<P & ECF.IChildProps>,
	elementProps: P & ECF.IChildProps,
	favoritesProps: IFavoritesProps = {}
): JSX.Element {
	return (
		<TodoStateHolder 
			Element={Element}
			elementProps={elementProps}
			favoritesProps={favoritesProps}
		/>
	);
}