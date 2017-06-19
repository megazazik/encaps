import * as React from "react";
import * as styles from "./styles.less";
import { IViewProps } from "./types";

export default function View (props: IViewProps): JSX.Element {
	return (
		<div 
			className={styles["field_container"] + (props.active ? "" : " " + styles["s-no_active"])}
			onMouseEnter={ (ev) => props.onStateChange(true) }
			onMouseLeave={ (ev) => props.onStateChange(false) }
		>
			<input 
				value={props.num} 
				className={styles["field"]}
				onChange={ (ev) => props.onChange(parseFloat(ev.currentTarget.value)) }
			/>
			<button 
				className={styles["btn"]} 
				onClick={ (ev) => props.onChange(props.num + 1)}
			>+</button>
		</div>
	);
}