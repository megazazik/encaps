import controller from "../controller";
import View from "../view";
import connect from "../connect";
import withStore from "../../../redux";

export const previewProps = {
	text: "Это заголовок, переданный через свойства."
}

export default withStore(controller.getReducer(), connect(View));