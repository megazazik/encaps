import controller from "../controller";
import View from "../view";
import { getStandalone } from "encaps-component-factory";

export const previewProps = {
	text: "Это заголовок, переданный через свойства компоненту с дочерними состояниями."
}

export default getStandalone(controller.getReducer(), controller.getComponent(View));