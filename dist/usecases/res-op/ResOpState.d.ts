import { IExecuteFunctions } from 'n8n-workflow';
import { INodeDescrBase, IOperationBase, IResourceBase } from './types';
import { StateBase } from '../../StateBase';
export declare abstract class ResOpState<TNodeDescr extends INodeDescrBase<TRes, TOp>, TRes extends IResourceBase<TOp>, TOp extends IOperationBase> extends StateBase {
    resource: TRes;
    operation: TOp;
    nodeDescr: TNodeDescr;
    resourceName: string;
    operationName: string;
    constructor(execFns: IExecuteFunctions, nodeDescr: TNodeDescr, resourceName: string, opearationName: string);
}
