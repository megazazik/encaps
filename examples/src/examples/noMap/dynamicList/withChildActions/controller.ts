import * as ECF from "encaps-component-factory";
import sumBuilder, { addField as sumAddField, subtractField as sumSubtractField } from "../sum/controller";
import fieldBuilder from "../../../field/controller";
import { IProps, IViewProps, NUMBERS_KEY, SUM_KEY } from "./types";

import createList from "../../list/controller";

const builder = ECF.createBuilder<IProps, {}, IViewProps>();

const dispatchSum = builder.addBuilder(SUM_KEY, sumBuilder);

export const listBuilderParams = createList(fieldBuilder, 2);
export const dispatchList = builder.addBuilder(NUMBERS_KEY, listBuilderParams.controller);

export default builder.getController();