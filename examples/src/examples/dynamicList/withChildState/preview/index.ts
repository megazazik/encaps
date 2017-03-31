import controller from "../controller";
import View from "../view";
import withStore from "../../../store";

export const previewProps = {
	text: "Это заголовок, переданный через свойства компоненту с дочерними состояниями."
}

export default withStore(controller.getReducer(), null, controller.getComponent(View));