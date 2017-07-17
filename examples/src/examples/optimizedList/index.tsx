import * as React from "react";

export interface IOptimazedProps<P> {
	component: React.ComponentClass<P> | React.StatelessComponent<P>
	componentProps: P[];
	maxLength?: number;
}

export default class OptimizedList<P> extends React.Component<IOptimazedProps<P>, {}> {
	static defaultProps = {
		maxLength: 5
	};

	shouldComponentUpdate (nextProps: IOptimazedProps<P>): boolean {
		return !this.arraysAreEqual(nextProps.componentProps, this.props.componentProps);
	}

	private arraysAreEqual(arr1: any[], arr2: any[]): boolean {
		if (arr1.length != arr2.length) {
			return false;
		}

		for (let i = 0; i < arr1.length; i++) {
			if (arr1[i] != arr2[i]) {
				return false;
			}
		}
		
		return true;
	}

	render () {
		if (this.props.componentProps.length > this.props.maxLength) {
			const childProps: P[][] = [];
			for (let i = 0; i < this.props.componentProps.length; i += this.props.maxLength) {
				childProps.push(this.props.componentProps.slice(i, i + this.props.maxLength));
			}
			const {children, ...propsNoChildren} = this.props;
			return (
				<div>
					{childProps.map( (childProp, index) => React.createElement(OptimizedList, {...propsNoChildren, componentProps: childProp, key: `optChild${index}`}))}
				</div>
			);
		} else {
			return (
				<div>
					{this.props.componentProps.map( (props, index) =>  React.createElement(this.props.component as any, {...props as any, key: `optChild${index}`}))}
				</div>
			);
		}		
	}
}