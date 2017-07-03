export interface IState {
	ids: string[]
}

export interface IViewProps extends IState {
	onAddItem: (id: string) => void;
	onRemoveItem: (id: string) => void;
}