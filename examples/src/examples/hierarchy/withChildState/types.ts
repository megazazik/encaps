import * as SumTypes from "../container/types";
import * as FieldTypes from "../../field/types";
import { IChildProps } from "encaps-component-factory";

export const FIELD1_KEY = "field1";
export const FIELD2_KEY = "field2";
export const SUM_KEY = "sum";


export interface IViewProps {
	sum: SumTypes.IViewProps;
	field1: IChildProps<FieldTypes.IState>;
	field2: IChildProps<FieldTypes.IState>;
}

export interface IState {
}

export {IState as ISumState} from "../container/types";
export {IState as IFieldState} from "../../field/types";
export {IProps} from "../container/types";
