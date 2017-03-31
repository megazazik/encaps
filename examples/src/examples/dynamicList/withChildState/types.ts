import * as SumTypes from "../sum/types";
import * as FieldTypes from "../../field/types";
import { IChildProps } from "encaps-component-factory";

export const NUMBERS_KEY = "numbers";
export const SUM_KEY = "sum";


import  { IViewProps as IListViewProps } from "../../list/controller";
export interface IViewProps {
	numbers: IListViewProps;
	sum: Partial<SumTypes.IViewProps>;
}

export {IProps} from "../sum/types";
