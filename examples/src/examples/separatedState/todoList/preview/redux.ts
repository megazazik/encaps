import controller from "../controller";
import View from "../view";
import withStore from "../../../redux";

export default withStore(controller.getReducer(), controller.getComponent(View));