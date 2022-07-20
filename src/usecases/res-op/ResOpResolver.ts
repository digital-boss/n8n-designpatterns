import { IOperationResolver } from "../../interfaces";

export class ResOpResolver<TOpFn, TResName extends string=string> implements IOperationResolver<TOpFn> {

	constructor (
    private operations: Record<TResName, Record<string, TOpFn>>,
		private resourceName: TResName,
		private operationName: string,
    private fallbackOp?: TOpFn,
	) {}

	getOperationMethod(): TOpFn {

		const res = this.operations[this.resourceName];

		if (!res) {
			throw new Error(`There is no resource: '${this.resourceName}'`);
		}

		const op: TOpFn = (res as any)[this.operationName];
		if (!op) {
      if (this.fallbackOp) {
        return this.fallbackOp;
      } else {
        throw new Error(`There is no operation: '${this.operationName}'`);
      }
		} else {
			return op;
		}
	}

}
