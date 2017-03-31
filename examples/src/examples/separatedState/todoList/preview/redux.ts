import controller from "../controller";
import View from "../view";
import withStore from "../../../redux";

export default withStore(controller.getReducer(), null, controller.getComponent(View));