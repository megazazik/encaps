import * as SumTypes from "../0_sum/types";
import * as FieldTypes from "../../field/types";
import { IState as IListState } from "../../list/controller";

export const NUMBERS_KEY = "items";
export const SUM_KEY = "sum";

export interface IState extends SumTypes.IState {
	items: IListState<FieldTypes.IState>;
}

export interface IViewProps {
	items: {getListItem: (index: number) => any}
}

export {IProps} from "../0_sum/types";
