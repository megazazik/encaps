import controller from "../controller";
import View from "../view";
import connect from "../connect";
import { getStandalone } from "encaps";

export const previewProps = {
	text: "Это заголовок, переданный через свойства в компонент с динамическим списком полей."
}

export default getStandalone(controller.getReducer(), connect(View));