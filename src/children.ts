import { build, Dictionary, IBuilder, IModel } from './controller';

export function children<AS extends Dictionary<IModel | IBuilder>> (
	childrenModels: AS
) {
	return build().children(childrenModels);
}