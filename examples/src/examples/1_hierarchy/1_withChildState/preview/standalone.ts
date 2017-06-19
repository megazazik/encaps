import controller from "../controller";
import Component from "../";
import { getStandalone } from "encaps-component-factory/standalone";

export const previewProps = {
	text: "Это заголовок, переданный через свойства."
}

export default getStandalone(controller.getReducer(), Component);