import { IState } from "../../interfaces";
import { NodeExecutorBase } from "../../NodeExecutorBase";
import { ResOpResolver } from "./ResOpResolver";
import { OperationFn } from "./types";
export declare class ResOpExecutor<TState extends IState, TClient, TResName extends string> extends NodeExecutorBase<TState> {
    private resolver;
    private client;
    constructor(state: TState, resolver: ResOpResolver<OperationFn<TClient, TState>, TResName>, client: TClient);
    protected executeCurrentItem(): Promise<any>;
}
