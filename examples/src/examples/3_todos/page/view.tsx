import * as React from 'react';
import FavoritesTodos from '../components/favoritesTodos';
import TodoList from '../components/todoList';
import { IViewProps, UI_COMPONENTS } from './controller';

export default function PageView(props: IViewProps) {
	return (
		<div>
			<FavoritesTodos favorites={props.favorites} {...props.todos} />
			<TodoList {...props.getChild(UI_COMPONENTS)} {...props.todos} />
		</div>
	);
}

