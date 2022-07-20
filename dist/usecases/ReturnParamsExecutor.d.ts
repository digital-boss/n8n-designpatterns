import { StateBase } from '../StateBase';
import { NodeExecutorBase } from '../NodeExecutorBase';
export declare class ReturnParamsExecutor extends NodeExecutorBase<StateBase> {
    executeCurrentItem(): Promise<any>;
}
