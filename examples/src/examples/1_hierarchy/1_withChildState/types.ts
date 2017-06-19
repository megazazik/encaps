import * as SumTypes from "../0_container/types";
import * as FieldTypes from "../../field/types";
import { IChildProps, IParentProps } from "encaps-component-factory/types";

export const FIELD1_KEY = "field1";
export const FIELD2_KEY = "field2";
export const SUM_KEY = "sum";

export interface IViewProps extends IParentProps {
	sum: SumTypes.IViewProps;
}

export interface IState {
}

export {IState as ISumState} from "../0_container/types";
export {IState as IFieldState} from "../../field/types";
export {IProps} from "../0_container/types";
