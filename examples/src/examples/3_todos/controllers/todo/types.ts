export interface ITodo {
	title: string;
	description: string;
	status: Status,
	id: number
}

export enum Status {
	New,
	InProgress,
	Done
}