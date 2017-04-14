import * as React from "react";
import { IViewProps } from "./types";
import TodoForm from "../todo";
import styles = require("./styles.less");

export default function View (props: IViewProps): JSX.Element {
	return (
		<div className={styles["container"]} >
			<div onClick={props.onExpand} >{props.todo.id} - {props.todo.title}</div>
			{props.expanded && (
				<div>
					<TodoForm todo={props.todo} onChange={props.onChange} />
					<div onClick={ () => props.onRemove(props.todo.id) }>Remove</div>
				</div>
			)}
		</div>
	);
}