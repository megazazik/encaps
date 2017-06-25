import { createBuilder } from "encaps-component-factory/controller";
import containerController from "../0_container/controller";
import fieldBuilder from "../../fieldN/controller";
import { IState, FIELD1_KEY, FIELD2_KEY, SUM_KEY } from "./types";

const builder = createBuilder<IState, {}>();

builder.addChild(SUM_KEY, containerController);
builder.addChild(FIELD1_KEY, fieldBuilder);
builder.addChild(FIELD2_KEY, fieldBuilder);

export default builder.getController();