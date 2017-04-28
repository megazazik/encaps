import controller from "../controller";
import View from "../view";
import withStore from "../../../store";

export const previewProps = {
	text: "Это заголовок, переданный через свойства в компонент с динамическим списком полей."
}

export default withStore(controller.getReducer(), controller.getComponent(View));