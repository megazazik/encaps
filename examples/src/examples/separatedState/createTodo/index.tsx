import * as React from "react";
import { ITodo, Status } from "../todo/types";
import styles = require("./styles.less");

let maxId = 2;

export default class CreateTodo extends React.Component<{onCreate: (todo: ITodo) => void}, {}> {
	private titleInput: HTMLInputElement;
	private textarea: HTMLTextAreaElement;
	private createTodo = () => {
		maxId++;
		this.props.onCreate({
			title: this.titleInput.value,
			description: this.textarea.value,
			id: maxId,
			status: Status.New
		});
	};

	render () {
		return (
			<div className={styles["container"]}>
				<input placeholder="Todo's title" type="text" ref={ (input) => { this.titleInput = input; } } className={styles["item"]} />
				<br/>
				<textarea placeholder="Description" cols={30} rows={3} ref={ (textarea) => { this.textarea = textarea; } } className={styles["item"]} />
				<br/>
				<button onClick={this.createTodo} className={styles["item"]}>Create Todo</button>
			</div>
		);
	}
}