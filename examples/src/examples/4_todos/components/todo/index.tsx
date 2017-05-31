import * as React from "react";
import { ITodo, Status } from "../../controllers/todo/types";

export interface IProps {
	todo: ITodo,
	onChange: (todo: ITodo) => void
}

export default class TodoView extends React.PureComponent<IProps, {}> {
	render () {
		return (
			<table><tbody>
				<tr>
					<td>id:</td>
					<td>{this.props.todo.id}</td>
				</tr>
				<tr>
					<td>Title:</td>
					<td>
						<input 
							value={this.props.todo.title}
							onChange={ (ev) => this.props.onChange({...this.props.todo, title: ev.currentTarget.value}) }
						/>
					</td>
				</tr>
				<tr>
					<td>Description: </td>
					<td>
						<input 
							value={this.props.todo.description}
							onChange={ (ev) => this.props.onChange({...this.props.todo, description: ev.currentTarget.value}) }
						/>
					</td>
				</tr>
				<tr>
					<td>Status: </td>
					<td>
						<select value={this.props.todo.status} onChange={(ev) => this.props.onChange({...this.props.todo, status: parseInt(ev.currentTarget.value) as Status})}>
							<option value={Status.New}>New</option>
							<option value={Status.InProgress}>In progress</option>
							<option value={Status.Done}>Done</option>
						</select>
					</td>
				</tr>
			</tbody></table>
		);
	}
}