export declare type EventHandler = (data: any) => void;
export default class EventDispatcher {
    private handlers;
    add(handler: EventHandler): void;
    remove(handler: EventHandler): void;
    notifyAll(data: any): void;
}
