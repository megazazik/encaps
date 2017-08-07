import * as React from "react";
import shallowEqual = require('fbjs/lib/shallowEqual');

export interface IOptimizedProps<P> {
	component: React.ComponentType<P>
	componentProps: P[];
	maxLength?: number;
	shallowEqual?: boolean;
}

function strictEqual (obj1: any, obj2: any): boolean {
	return obj1 === obj2;
}

export default class OptimizedList<P> extends React.Component<IOptimizedProps<P>, {}> {
	static defaultProps = {
		maxLength: 5,
		shallowEqual: true
	};

	shouldComponentUpdate (nextProps: IOptimizedProps<P>): boolean {
		return !this.arraysAreEqual(nextProps.componentProps, this.props.componentProps);
	}

	private arraysAreEqual(arr1: any[], arr2: any[]): boolean {
		if (arr1.length != arr2.length) {
			return false;
		}

		const equal = this.props.shallowEqual ? shallowEqual : strictEqual;

		for (let i = 0; i < arr1.length; i++) {
			if (!equal(arr1[i], arr2[i])) {
				return false;
			}
		}
		
		return true;
	}

	render () {
		if (this.props.componentProps.length > this.props.maxLength) {
			const childProps: P[][] = [];
			const itemCount = Math.floor(this.props.componentProps.length / this.props.maxLength);
			for (let i = 0; i < this.props.componentProps.length; i += itemCount) {
				childProps.push(this.props.componentProps.slice(i, i + itemCount));
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