import * as SumTypes from "../sum/types";
import * as FieldTypes from "../../../field/types";
import * as ListTypes from "../../list/controller";
import { ViewProps, IChildProps } from "encaps-component-factory";

export const NUMBERS_KEY = "numbers";
export const SUM_KEY = "sum";

export interface IState {
	sum: SumTypes.IState;
	numbers: ListTypes.IState<FieldTypes.IState>;
}

export interface IViewProps extends ViewProps<SumTypes.IProps, IState> {
	numbers?: ViewProps<{}, ListTypes.IState<FieldTypes.IState>>;
	sum?: ViewProps<SumTypes.IProps, SumTypes.IState>;
}

export { IProps } from "../sum/types";