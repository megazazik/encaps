import * as ECF from "encaps-component-factory";
import sumBuilder, { createAddField, createSubtractField } from "../0_sum/controller";
import fieldBuilder from "../../field/controller";
import { IProps, IViewProps, NUMBERS_KEY, SUM_KEY } from "./types";

const builder = ECF.createBuilder<IProps, {}, IViewProps>();


