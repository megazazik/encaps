import * as ECF from "encaps-component-factory";
import { IProps, IViewProps, IState } from "./types";

const builder = ECF.createBuilder<IProps, IState, IViewProps>();

builder.setInitState(() => ({
	numbers: [0, 0]
}));

interface INumberChange {
	value: number;
	index: number;
}

const numChange = builder.addHandler<INumberChange>(
	'numChange', 
	(state, action: ECF.IAction<INumberChange>) => { 
		const numbers =  [...state.numbers];
		numbers[action.payload.index] = action.payload.value;
		return { numbers };
	}
);

export const addField = builder.addDispatchedHandler<{}>(
	'addField', 
	(state, action: ECF.IAction<{}>) => { 
		const numbers =  [...state.numbers];
		numbers.push(0);
		return { numbers };
	}
);

export const subtractField = builder.addDispatchedHandler<{}>(
	'subtractField', 
	(state, action: ECF.IAction<{}>) => { 
		const numbers =  [...state.numbers];
		numbers.pop();
		return { numbers };
	}
);

builder.setStateToProps((state, props) =>({
	...state, 
	headerText: props.text,
	result: state.numbers.reduce((prev, current) => (prev + current))
}));

builder.setDispatchToProps((dispatch, props) =>({
	onNumberChange: (value, index) => dispatch(numChange({ value, index })),
	onAddField: () => addField(dispatch, null),
	onSubtractField: () => subtractField(dispatch, null)
}))

export default builder.getController();