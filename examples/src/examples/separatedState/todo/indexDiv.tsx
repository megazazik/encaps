import * as React from "react";
import { ITodo, Status } from "./types";
import styles = require("./styles.less");

export interface IProps {
	todo: ITodo,
	onChange: (todo: ITodo) => void
}

export default class TodoView extends React.PureComponent<IProps, {}> {
	render () {
		return (
			<div>
				<div>
					<div className={styles.item}>id:</div>
					<div className={styles.item}>{this.props.todo.id}</div>
				</div>
				<div>
					<div className={styles.item}>Title:</div>
					<div className={styles.item}>
						<input 
							value={this.props.todo.title}
							onChange={ (ev) => this.props.onChange({...this.props.todo, title: ev.currentTarget.value}) }
						/>
					</div>
				</div>
				<div>
					<div className={styles.item}>Description: </div>
					<div className={styles.item}>
						<input 
							value={this.props.todo.description}
							onChange={ (ev) => this.props.onChange({...this.props.todo, description: ev.currentTarget.value}) }
						/>
					</div>
				</div>
				<div>
					<div className={styles.item}>Status: </div>
					<div className={styles.item}>
						<select value={this.props.todo.status} onChange={(ev) => this.props.onChange({...this.props.todo, status: parseInt(ev.currentTarget.value) as Status})}>
							<option value={Status.New}>New</option>
							<option value={Status.InProgress}>In progress</option>
							<option value={Status.Done}>Done</option>
						</select>
					</div>
				</div>
			</div>
		);
	}
}