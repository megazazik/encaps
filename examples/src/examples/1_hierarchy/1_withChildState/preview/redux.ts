import withStore from "../../../redux";
import controller from "../controller";
import Component from "../";

export const previewProps = {
	text: "Это заголовок, переданный через свойства."
}

export default withStore(controller.getReducer(), Component);