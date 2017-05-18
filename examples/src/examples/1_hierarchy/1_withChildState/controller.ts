import * as ECF from "encaps-component-factory";
import containerBuilder from "../0_container/controller";
import fieldBuilder from "../../field/controller";
import { IProps, IViewProps, IState, IFieldState, ISumState, FIELD1_KEY, FIELD2_KEY, SUM_KEY } from "./types";

const builder = ECF.createBuilder<IProps, IState, IViewProps>();

builder.addBuilder(SUM_KEY, containerBuilder);
builder.addChildBuilder(FIELD1_KEY, fieldBuilder);
builder.addChildBuilder(FIELD2_KEY, fieldBuilder);

export default builder.getController();