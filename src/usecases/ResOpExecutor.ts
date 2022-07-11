import { IDataObject, IExecuteFunctions, NodeApiError, NodeOperationError } from 'n8n-workflow';
import { INodeDescrBase, IOperationBase, IResourceBase } from 'generator/usecases/res-op/types';
import { NodeExecutorBase } from '../NodeExecutorBase';
import { IExecItemDependance } from '../interfaces';

export abstract class ResOpExecutor<
	TNodeDescr extends INodeDescrBase<TRes, TOp>,
	TRes extends IResourceBase<TOp>,
	TOp extends IOperationBase,
	TExecFn extends IExecItemDependance,
	TClient=never,
> extends NodeExecutorBase<TExecFn> {

	operation: TOp;

	// from c-tor:
	nodeDescr: TNodeDescr;
	resourceName: string;
	operationName: string;
	client: TClient;

	constructor (
		nodeDescr: TNodeDescr,
		resourceName: string,
		opearationName: string,
		execFnHelper: TExecFn,
		client: TClient,
	) {
		super(execFnHelper);

		this.nodeDescr = nodeDescr;
		this.resourceName = resourceName;
		this.operationName = opearationName;
		this.client = client;

		this.operation = this.nodeDescr.resources[this.resourceName].operations[this.operationName];
	}
}
