import * as SumTypes from "../0_container/types";
import * as FieldTypes from "../../../field/types";
import { IChildProps, ViewProps } from "encaps-component-factory";

export const FIELD1_KEY = "field1";
export const FIELD2_KEY = "field2";
export const SUM_KEY = "sum";


export interface IViewProps extends ViewProps<SumTypes.IProps, IState> {
	sum: ViewProps<SumTypes.IProps, SumTypes.IState>;
}

export interface IState {
	sum: SumTypes.IState;
	field1: FieldTypes.IState;
	field2: FieldTypes.IState;
}

export {IState as ISumState} from "../0_container/types";
export {IState as IFieldState} from "../../../field/types";
export {IProps} from "../0_container/types";
