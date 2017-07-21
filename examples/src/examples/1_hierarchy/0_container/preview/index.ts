import controller from "../controller";
import View from "../view";
import createComponent from "../index";
import { getStandalone } from "encaps-component-factory/standalone";

export const previewProps = {
	text: "Это заголовок, переданный через свойства."
}

export default getStandalone(controller.getReducer(), createComponent(View));