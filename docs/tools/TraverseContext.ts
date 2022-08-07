import { ConditionFn } from "./transform";

export interface MarkedData<TTypeName> {
	type: TTypeName;
}

const getDeepValue = (path: Array<string | number>, obj: any) => path.reduce((acc, i) => acc[i], obj);

export interface MarkedData<TTypeName> {
	type: TTypeName;
}

const jsTypesMatchers = new Map([
	['str', (v: any) => typeof v === 'string'],
	['num', (v: any) => typeof v === 'number'],
	['arr', (v: any) => Array.isArray(v)],
	['obj', (v: any) => !Array.isArray(v) && v instanceof Object],
]);

export class TraverseContext<TTypeName, TSrc=any> {
	sourceObj: TSrc;
	path: Array<string | number> = [];
	data: Record<string, MarkedData<TTypeName>> = {};

	constructor (sourceObj: TSrc) {
		this.sourceObj = sourceObj;
	}

	private log (debug: boolean, ...args: any[]) {
		if (debug) {
			const msg = args.map(i => {
				if (typeof i === 'object') {
					return JSON.stringify(i);
				}
				return i.toString();
			}).join('');

			console.log(msg);
		}
	}

	private getPathBySliceEnd (sliceEnd: number): Array<string | number> {
		return this.path.slice(0, sliceEnd);
	}

	private getPath (index?: Array<string | number> | number) {
		return index === undefined || index === 0
			? this.path
			: index instanceof Array
			? index
			: this.getPathBySliceEnd(index);
	}

	isMatchCustomType(type: TTypeName, pathIndexRev: number, debug = false) {
		const data = this.getData(pathIndexRev * -1);
		this.log(debug, `isMatchCustomType: data?.type=${data?.type}, type=${type}`);
		return data?.type === type;
	}

	isMatchJsType(type: string, pathIndexRev: number, debug = false) {
		const matcher = jsTypesMatchers.get(type);
		if (matcher) {
			const v = this.getValue(pathIndexRev * -1);
			const res = matcher(v);
			this.log(
				debug,
				`isMatchJsType: ${type}, pathIndexRev=${pathIndexRev} path=`,
				this.getPath(pathIndexRev * -1).join('.'),
				'. v=',
				typeof v === 'string' ? v : '{...}',
				`. ${res}`,
			);
			return res;
		}
		throw new Error(`Unexpected js type: ${type}`);
	}

	/**
	 *
	 * @param pattern Example: * ::obj,Resource
	 * @param pathIndexRev Reversed path index: last = 0, then 1, 2...
	 */
	isMatchPart(pattern: string, pathIndexRev: number, debug = false): boolean {
		if (pathIndexRev > this.path.length) {
			return false;
		}
		const [propName, typesStr] = pattern.split(/\s*::\s*/);
		const types = typesStr ? typesStr.split(/\s*,\s*/) : [];
		const pathPart = this.path[this.path.length-1-pathIndexRev];

		this.log(debug, `isMatchPart: pathPart=${pathPart}, propName=${propName}, types`, types);
		if (propName !== '' && propName !== '*') {
			if (pathPart !== propName) {
				this.log(debug, 'NOT MATCH');
				return false;
			}
		}

		return types.every(v => {
			return jsTypesMatchers.has(v)
				? this.isMatchJsType(v, pathIndexRev, debug)
				: this.isMatchCustomType(v as unknown as TTypeName, pathIndexRev, debug);
		}, this);
	}

	/**
	 * Match traverse context to pattern.
	 * Pattern example: "::Root / resources ::obj / * ::obj,Resource / operations / * ::Operation / params ::arr / * ::obj".
	 * Here we have two types of matches (sep by ::):
	 * 1. property match: either '*' or string.
	 * 2. type match:
	 * 2.1. system types: str, num, obj, arr.
	 * 2.2. state custom type.
	 * @param pattern Example: "::Root / resources ::obj / * ::obj,Resource / operations / * ::Operation / params ::arr / * ::obj"
	 * @param debug Usage example: const debug = ctx.path.join('.').startsWith('resources.group.operations.createMulti.params.0.options.0');
	 * @returns
	 */
	isMatch (pattern: string, debug = false): boolean {

		const parts = pattern.split(/\s*\/\s*/);
		this.log(debug, 'parts: ', parts);
		return parts.reverse().every((p, i) => this.isMatchPart(p, i, debug), this);
	}

	getValue (index?: Array<string | number> | number): any {
		const path = this.getPath(index);
		return getDeepValue(path, this.sourceObj);
	}

	getData (index?: Array<string | number> | number): MarkedData<TTypeName> | undefined {
		const path = this.getPath(index);
		if (path === undefined) {
			return undefined;
		}
		return this.data[path.join('.')];
	}

	setData (path: Array<string | number>, data: MarkedData<TTypeName>) {
		this.data[path.join('.')] = data;
	}
}

export const match = <TTypeName, TSrc=any>(pattern: string): ConditionFn<TraverseContext<TTypeName, TSrc>> => (v, ctx) => ctx.isMatch(pattern);