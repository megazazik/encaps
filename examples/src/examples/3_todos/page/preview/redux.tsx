import controller, { connect } from "../controller";
import Component from "../view";
import withStore from "../../../redux";

export default withStore(
	controller.getReducer(),
	connect(Component)
);