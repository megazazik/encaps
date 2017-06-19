import controller from "../controller";
import View from "../view";
import connect from "../connect";
import { getStandalone } from "encaps-component-factory/standalone";

export const previewProps = {
	text: "Это заголовок, переданный через свойства."
}

export default getStandalone(controller.getReducer(), connect(View));