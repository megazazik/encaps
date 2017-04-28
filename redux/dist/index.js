"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_redux_1 = require("react-redux");
var encaps_component_factory_1 = require("encaps-component-factory");
// const InnerStateHolder = (props: {
//     state: any, 
//     dispatch: (action: IAction<any>) => void,
//     holderProps: IStateHolderProps
// }): JSX.Element => {
//     const stateProps: IChildProps<any> = {
// 		doNotAccessThisInnerState: props.holderProps.code ? props.state[props.holderProps.code] : props.state,
// 		doNotAccessThisInnerDispatch: props.holderProps.code ? wrapDispatch(props.dispatch, props.holderProps.code) : props.dispatch
// 	}
//     return React.createElement(props.holderProps.Element as any, {...props.holderProps.elementProps, ...stateProps});
// }
// const connectedComponent = reduxConnect(
//     (state: any, props: IStateHolderProps) => ({
//         state,
//         holderProps: props
//     }),
//     (dispatch: (action: IAction<any>) => void) => ({ dispatch })
// )(InnerStateHolder);
// const ReduxStateHolder: React.StatelessComponent<IStateHolderProps> = (props: IStateHolderProps): JSX.Element => {
//     return React.createElement(connectedComponent, props);
// }
function connect(stateToComponentState, dispatchToComponentDispatch) {
    if (stateToComponentState === void 0) { stateToComponentState = function (state) { return state; }; }
    if (dispatchToComponentDispatch === void 0) { dispatchToComponentDispatch = function (dispatch) { return dispatch; }; }
    return react_redux_1.connect(function (state, props) { return ({ doNotAccessThisInnerState: stateToComponentState(state, props) }); }, function (dispatch, props) { return ({ doNotAccessThisInnerDispatch: dispatchToComponentDispatch(dispatch, props) }); });
}
exports.connect = connect;
function setReduxAsDefaultConnect() {
    encaps_component_factory_1.setConect(connect);
}
exports.setReduxAsDefaultConnect = setReduxAsDefaultConnect;
// export default ReduxStateHolder; 
