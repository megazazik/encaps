import * as ECF from "encaps-component-factory";
import itemBuilder from "../todoListItem/controller";
import { IProps, IViewProps, TODOS_KEY, LIST_ITEMS_KEY } from "./types";
import createList from "../../listWithKeys/controller";

const builder = ECF.createBuilder<IProps, {}, IViewProps>();

builder.addBuilder(LIST_ITEMS_KEY, createList(itemBuilder, ["1", "2"]).controller);

builder.setGetProps( (state, dispatch, props) => ({
	todos: props.todos
}) );

export default builder.getController();