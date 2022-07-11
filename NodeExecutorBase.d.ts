import { IExecItemDependance, ItemExecFn } from './interfaces';
export declare abstract class NodeExecutorBase<TExecFn extends IExecItemDependance> {
    itemIndex: number;
    node: TExecFn;
    constructor(node: TExecFn);
    execute: ItemExecFn;
    protected abstract executeCurrentItem(): Promise<any>;
}
