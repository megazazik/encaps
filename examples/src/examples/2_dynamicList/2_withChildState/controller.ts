import * as ECF from "encaps-component-factory";
import sumBuilder from "../0_sum/controller";
import fieldBuilder from "../../field/controller";
import { IProps, IViewProps, NUMBERS_KEY, SUM_KEY } from "./types";

import createList from "../../list/controller";

const builder = ECF.createBuilder<IProps, {}, IViewProps>();

builder.addBuilder(SUM_KEY, sumBuilder);
builder.addBuilder(NUMBERS_KEY, createList(fieldBuilder, 2).controller);

export default builder.getController();