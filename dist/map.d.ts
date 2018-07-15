import { IModel, IActionCreators } from './controller';
export declare function createMap<Actions extends IActionCreators = {}, State = {}>(model: IModel<Actions, State>): import("../../../../../../Users/\u041C\u0438\u0445\u0430\u0438\u043B/Projects/megazazik/encaps-component-factory/src/controller").IBuilder<{
    item: (key: string) => Actions;
} & import("../../../../../../Users/\u041C\u0438\u0445\u0430\u0438\u043B/Projects/megazazik/encaps-component-factory/src/controller").IPublicActionCreators<{
    add: string;
    remove: string;
}>, {
    items: {
        [key: string]: State;
    };
}>;
