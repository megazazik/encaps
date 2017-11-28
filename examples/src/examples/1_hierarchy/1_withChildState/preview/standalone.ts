import controller from "../controller";
import Component from "../";
import { getStandalone } from "encaps-react";

export const previewProps = {
	text: "Это заголовок, переданный через свойства."
}

export default getStandalone(controller.getReducer(), Component);