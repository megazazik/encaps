import * as React from 'react';
import * as ReactDom from 'react-dom';
import ErrorComponent from './_error';
import TestRunner from "./view";
import {ITestRunnerViewProps, ITestRunnerProps} from "./props";

let controller: TestRunnerController;

export default function initTests(element: HTMLElement) {
	if (!element) {
		throw new Error("The 'element' argument must be defined.");
	}
	controller = new TestRunnerController(element);
	importComponent();
}

//-------Hot Module Replacement---------
declare var module: any;
if (module.hot) {
	module.hot.accept('./fakeTestModule.tsx', () => {
		importComponent();
	});
}
//-------Hot Module Replacement---------

function importComponent (): void {
	try {
		var component = require('./fakeTestModule.tsx');
		controller.setTestedComponent(
			component.default || component,
			component && component.previewProps
		);
		controller.setFatalError(null);
	} catch (error) {
		controller.setFatalError(error);
	}
	controller.update();
}

class TestRunnerController {
	private _fatalError: Error;
	private _testedComponent: any;
	private _defaultProps: any;
	private _error: Error;
	private _isRendering: boolean = false;
	private _props: ITestRunnerViewProps = {
		props: "",
		forceUpdate: false,
		catchAllErrors: false,
		onChange: (newProps: ITestRunnerProps): void => {
			this._setProps(newProps);
			this.update();
		}
	};

	constructor (private _element: HTMLElement) {
		this.init();
	}

	init (): void {
		window.addEventListener("error", (ev: ErrorEvent) => {
			if ((this._isRendering || this._props.catchAllErrors) && !this._error) {
				// ev.preventDefault();
				// console.error(ev.error);
				this._error = ev.error;
				this.update();
			}
		});
	}

	setFatalError (error: Error): void {
		this._fatalError = error;
	}

	setTestedComponent (component: any, defaultProps: any): void {
		this._testedComponent = component;
		this._defaultProps = defaultProps;
		this._checkDefaultProps();
	}

	private _checkDefaultProps (): void {
		if (!this._props.props && !!this._defaultProps) {
			this._props.props = JSON.stringify(this._defaultProps, null, "\t");
		}
	}

	private _setProps(newProps: ITestRunnerProps): void {
		this._error = null;
		this._props = {...this._props, ...newProps};
		this._checkDefaultProps();
	}

	update (): void {
		this._isRendering = true;

		const currrentError = this._fatalError || this._error;
		if (!!currrentError) {
			this._render(<ErrorComponent error={currrentError} />);
			return;
		}
		
		if (this._props.forceUpdate) {
			this._render(null, () => {
				this._render(<this._testedComponent {...this._getTestedComponentProps()} />);
			});
		} else {
			this._render(<this._testedComponent {...this._getTestedComponentProps()} />);
		}
	}

	private _getTestedComponentProps(): any {
		return !!this._props.props ? 
			eval(`(${this._props.props})`) : 
			{};
	}

	private _render (children?: React.ReactNode, callback: () => void = () => { this._isRendering = false; }) {
		ReactDom.render(
			<TestRunner {...this._props}>
				{children}
			</TestRunner>,
			this._element,
			callback
		);
	}
}