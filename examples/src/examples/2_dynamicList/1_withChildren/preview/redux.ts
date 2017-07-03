import controller from "../controller";
import View from "../";
import withStore from "../../../redux";

export const previewProps = {
	text: "Это заголовок, переданный через свойства."
}

export default withStore(controller.getReducer(), View);