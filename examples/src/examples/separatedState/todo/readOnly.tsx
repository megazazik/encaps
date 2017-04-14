import * as React from "react";
import { ITodo, Status } from "./types";

export interface IProps {
	todo: ITodo
}

export default class TodoView extends React.Component<IProps, {}> {
	shouldComponentUpdate (nextProps: IProps): boolean {
		return nextProps.todo != this.props.todo;
	}

	render () {
		return (
			<table><tbody>
				<tr>
					<td>id:</td>
					<td>{this.props.todo.id}</td>
				</tr>
				<tr>
					<td>Title:</td>
					<td>{this.props.todo.title}</td>
				</tr>
				<tr>
					<td>Description: </td>
					<td>{this.props.todo.description}</td>
				</tr>
				<tr>
					<td>Status: </td>
					<td>{Status[this.props.todo.status]}</td>
				</tr>
			</tbody></table>
		);
	}
}