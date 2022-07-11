import { ExecFnHelperBase } from '../ExecFnHelperBase';
import { NodeExecutorBase } from '../NodeExecutorBase';
export declare class ReturnParamsExecutor extends NodeExecutorBase<ExecFnHelperBase> {
    executeCurrentItem(): Promise<any>;
}
