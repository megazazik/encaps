import * as SumTypes from "../0_sum/types";
import * as FieldTypes from "../../field/types";
import { IViewProps as IListViewProps, IState as IListState } from "../../listN/controller";

export const NUMBERS_KEY = "numbers";
export const SUM_KEY = "sum";

export interface IState {
	sum: SumTypes.IState;
	numbers: IListState<FieldTypes.IState>;
}

export interface IViewProps extends SumTypes.IViewProps {
	getListItem: (index: number) => any
}

export {IProps} from "../0_sum/types";
