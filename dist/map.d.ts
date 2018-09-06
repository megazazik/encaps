import { IModel, IActionCreators } from './controller';
export declare function createMap<Actions extends IActionCreators = {}, State = {}>(model: IModel<Actions, State>): import("./controller").IBuilder<{
    item: (key: string) => Actions;
} & import("./controller").IPublicActionCreators<{
    add: string;
    remove: string;
}>, {
    items: {
        [key: string]: State;
    };
}>;
