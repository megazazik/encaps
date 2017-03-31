import * as React from "react";
import { ITodo, Status } from "./types";

interface IProps {
	todo: ITodo,
	onChange: (todo: ITodo) => void
}

export default function View (props: IProps): JSX.Element {
	return (
		<table><tbody>
			<tr>
				<td>id:</td>
				<td>{props.todo.id}</td>
			</tr>
			<tr>
				<td>Title:</td>
				<td>
					<input 
						value={props.todo.title}
						onChange={ (ev) => props.onChange({...props.todo, title: ev.currentTarget.value}) }
					/>
				</td>
			</tr>
			<tr>
				<td>Description: </td>
				<td>
					<input 
						value={props.todo.description}
						onChange={ (ev) => props.onChange({...props.todo, description: ev.currentTarget.value}) }
					/>
				</td>
			</tr>
			<tr>
				<td>Status: </td>
				<td>
					<select value={props.todo.status} onChange={(ev) => props.onChange({...props.todo, status: parseInt(ev.currentTarget.value) as Status})}>
						<option value={Status.New}>New</option>
						<option value={Status.InProgress}>In progress</option>
						<option value={Status.Done}>Done</option>
					</select>
				</td>
			</tr>
		</tbody></table>
	);
}