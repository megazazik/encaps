import * as SumTypes from "../0_sum/types";
import * as FieldTypes from "../../field/types";

export const NUMBERS_KEY = "numbers";
export const SUM_KEY = "sum";

import  { IViewProps as IListViewProps } from "../../list/controller";
export interface IViewProps {
	numbers?: IListViewProps<FieldTypes.IState>;
	sum?: SumTypes.IViewProps;
	onAddField: () => void;
	onSubtractField: () => void;
}

export {IProps} from "../0_sum/types";
