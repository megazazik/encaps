import { IModel, IActionCreators } from './controller';
export declare function createList<Actions extends IActionCreators = {}, State = {}>(model: IModel<Actions, State>): import("./controller").IBuilder<{
    item: (index: number) => Actions;
} & import("./controller").IPublicActionCreators<{
    add: number;
    subtract: number;
    remove: number;
    insert: number;
}>, {
    items: State[];
}>;
