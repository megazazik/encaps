import * as ECF from "encaps-component-factory";
import { IProps, IViewProps, FAVORITES_KEY } from "./types";
import favoritesController from "../favorites/controller";

const builder = ECF.createBuilder<IProps, {}, IViewProps>();

builder.addBuilder(FAVORITES_KEY, favoritesController);

builder.setGetProps( (state, dispatch, props) => ({
	...props
}) );
export default builder;