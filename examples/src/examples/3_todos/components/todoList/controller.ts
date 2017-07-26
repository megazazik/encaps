import { createBuilder } from "encaps-component-factory/controller";
import { IAction } from "encaps-component-factory/types";
import itemBuilder from "../todoListItem/controller";
import { IProps, IViewProps, TODOS_KEY, LIST_ITEMS_KEY } from "./types";
import createList from "../../../lazyKeyList/controller";

export const listController = createList(itemBuilder);

const builder = createBuilder()
	.addChild(LIST_ITEMS_KEY, listController);

export default builder.getController();