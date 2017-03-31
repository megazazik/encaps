import controller from "../controller";
import View from "../view";
import withStore from "../../../redux";
import { Status } from "../../todo/types";

export const previewProps = {
	todos: {
		1: {
			title: "Todo1",
			description: "Do something",
			status: Status.InProgress,
			id: 1
		},
		2: {
			title: "The second Todo",
			description: "Do something",
			status: Status.New,
			id: 2
		}
	}
}

export default withStore(controller.getReducer(), null, controller.getComponent(View));