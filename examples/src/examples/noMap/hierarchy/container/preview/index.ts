import controller from "../controller";
import View from "../view";
import * as ECF from "encaps-component-factory";

export const previewProps = {
	text: "Это заголовок, переданный через свойства."
}

export default ECF.getStandalone(controller.getReducer(), controller.getComponent(View));