import * as React from "react";
import { ITodo, Status } from "../../controllers/todo/types";

export interface IProps {
	todo: ITodo
}

export default class ReadOnlyTodoView extends React.PureComponent<IProps, {}> {
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