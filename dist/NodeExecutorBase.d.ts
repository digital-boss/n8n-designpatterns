import { IState, ItemExecFn } from './interfaces';
export declare abstract class NodeExecutorBase<TState extends IState> {
    itemIndex: number;
    state: TState;
    constructor(node: TState);
    execute: ItemExecFn;
    protected abstract executeCurrentItem(): Promise<any>;
}
