import { IOperationResolver } from "../../interfaces";
export declare class ResOpResolver<TOpFn, TResName extends string = string> implements IOperationResolver<TOpFn> {
    private operations;
    private resourceName;
    private operationName;
    private fallbackOp?;
    constructor(operations: Record<TResName, Record<string, TOpFn>>, resourceName: TResName, operationName: string, fallbackOp?: TOpFn | undefined);
    getOperationMethod(): TOpFn;
}
