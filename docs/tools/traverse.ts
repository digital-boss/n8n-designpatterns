export type VisitFn<T=any> = (
	value: unknown,
	path: Array<string | number>,
	sourceObj: T,
) => void;

export type MapFn<T> = (
	value: unknown,
	path: Array<string | number>,
	sourceObj: T,
) => any;

type Action = 'visit' | 'map';

const traverseInternal = <T, TRes=T>(
	fn: MapFn<T>,
	value: unknown,
	path: Array<string | number>,
	sourceObj: T,
): TRes => {
	if (value instanceof Array) {
		return fn(value.map(
			(v, idx) => traverseInternal(fn, v, [...path, idx], sourceObj),
		), path, sourceObj) as unknown as TRes;
	} else if (value !== null && typeof value === 'object') {
		const result = Object.entries(value)
			.map(([k, v]) => [k, traverseInternal(fn, v, [...path, k], sourceObj)]);
		return fn(Object.fromEntries(result), path, sourceObj);
	}
	return value as TRes;
};

export const traverse = <T, TRes=T>(fn: MapFn<T>, obj: T): TRes => {
	return traverseInternal(fn, obj, [], obj);
};
