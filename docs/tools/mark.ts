import { VisitFn } from './traverse';
import { MarkedData, TraverseContext } from './TraverseContext';

export type TypeResolvers<TTypeName, TSrc> = Array<[TTypeName, (ctx: TraverseContext<TTypeName, TSrc>, value: any) => boolean]>;

export const createTypeMarker = <TTypeName, TSrc>(
	ctx: TraverseContext<TTypeName, TSrc>,
	resolvers: TypeResolvers<TTypeName, TSrc>,
): VisitFn => (value: any, path: Array<string | number>, sourceObj: any) => {
	ctx.path = [...path];
	const res = resolvers.find(([_, r]) => r(ctx, value));
	if (res) {
		ctx.setData(path, {type: res[0]});
	}
};


