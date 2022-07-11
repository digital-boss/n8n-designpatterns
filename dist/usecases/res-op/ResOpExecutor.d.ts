import { NodeExecutorBase } from '../../NodeExecutorBase';
import { IExecItemDependance } from '../../interfaces';
import { INodeDescrBase, IOperationBase, IResourceBase } from './types';
export declare abstract class ResOpExecutor<TNodeDescr extends INodeDescrBase<TRes, TOp>, TRes extends IResourceBase<TOp>, TOp extends IOperationBase, TExecFn extends IExecItemDependance, TClient = never> extends NodeExecutorBase<TExecFn> {
    operation: TOp;
    nodeDescr: TNodeDescr;
    resourceName: string;
    operationName: string;
    client: TClient;
    constructor(nodeDescr: TNodeDescr, resourceName: string, opearationName: string, execFnHelper: TExecFn, client: TClient);
}
