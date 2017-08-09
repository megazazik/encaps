import { createBuilder } from "encaps/controller";
import { builder as originalBuilder} from "../0_container/controller";
import fieldBuilder from "../../field/controller";
import { IState, FIELD1_KEY, FIELD2_KEY, SUM_KEY } from "./types";

const builder = originalBuilder
	.addChild(FIELD1_KEY, fieldBuilder)
	.addChild(FIELD2_KEY, fieldBuilder);

export default builder.getController();