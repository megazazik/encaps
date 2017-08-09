import { IChildProps, IParentProps } from "encaps/types";
import { IProps, IState as ISumState, IPublicProps, IPublicActions } from "../0_container/types";

export const FIELD1_KEY = "field1";
export const FIELD2_KEY = "field2";
export const SUM_KEY = "sum";

export interface IViewProps extends IProps, IParentProps, IPublicProps, IPublicActions {
};

export interface IState {
	sum: ISumState
}

export { IProps };
