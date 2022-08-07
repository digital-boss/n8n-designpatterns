import { VisitFn as MapFn } from './traverse';

interface ICtx {
	path: Array<string | number>
}

export type ConditionFn<TCtx extends ICtx> = (value: any, ctx: TCtx) => boolean;
export type TransformerFn<TCtx extends ICtx> = (value: any, ctx: TCtx) => any;
type Transformer<TCtx extends ICtx> = TransformerFn<TCtx> | Array<TransformerFn<TCtx> | ConditionalTransformer<TCtx>>;
type ConditionalTransformer<TCtx extends ICtx> = [
	ConditionFn<TCtx>,
	Transformer<TCtx>
];
export type Transformers<TCtx extends ICtx> = Array<ConditionalTransformer<TCtx>>;

// Three variants of Transformer. Numbers represents TransformerFn (functions).
// const x = [
// 	['?', 1],
// 	['?', [1,2,3]],
// 	['?', [
// 		['?', 1]
// 	]]
// ];

const applyTransformersRec = <TCtx extends ICtx>(
	conditionFn: ConditionFn<TCtx>,
	transformer: Transformer<TCtx>,
	value: any,
	ctx: TCtx,
) => {
	if (conditionFn(value, ctx)) {
		let result: any = value;
		if (typeof transformer === 'function') {
			result = transformer(result, ctx);
		} else if (transformer instanceof Array) {
			transformer.forEach(tr => {
				if (typeof tr === 'function') {
					result = tr(result, ctx);
				} else if (tr instanceof Array) {
					const [c, t] = tr;
					result = applyTransformersRec(c, t, result, ctx);
				}
			});
		} else {
			throw new Error('Unexpected value type.');
		}
		return result;
	}
	return value;
};

export const createMapFromTransformers = <TCtx extends ICtx>(
	ctx: TCtx,
	transformers: Transformers<TCtx>,
): MapFn => (value: any, path: Array<string | number>, sourceObj: any) => {
	ctx.path = [...path];
	let result: any = value;
	for (const [cond, tr] of transformers) {
		result = applyTransformersRec(cond, tr, result, ctx);
	}
	return result;
};

