export type EventHandler = (data: any) => void;

export default class EventDispatcher {
	private handlers: EventHandler[] = [];

	add (handler: EventHandler): void {
		if (handler && this.handlers.indexOf(handler) == -1) {
			this.handlers.push(handler);
		}
	}

	remove (handler: EventHandler): void {
		if (handler && this.handlers.indexOf(handler) >= 0) {
			this.handlers.splice(this.handlers.indexOf(handler), 1);
		}
	}

	notifyAll (data: any): void {
		this.handlers.forEach( handler => handler(data) );
	}
}