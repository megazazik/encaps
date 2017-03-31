import * as ECF from "encaps-component-factory";
import todosController from "../todoList/controller";
import itemBuilder from "../todoListItem/controller";
import { IProps, IViewProps, TODOS_KEY, LIST_ITEMS_KEY } from "./types";
import createList from "../../listWithKeys/controller";

const builder = ECF.createBuilder<IProps, {}, IViewProps>();

builder.addBuilder(TODOS_KEY, todosController);
builder.addBuilder(LIST_ITEMS_KEY, createList(itemBuilder, ["1", "2"]).builder);

export default builder;