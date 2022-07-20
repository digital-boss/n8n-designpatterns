import { IExecuteFunctions } from 'n8n-workflow';
import { INodeDescrBase, IOperationBase, IResourceBase } from './types';
import { StateBase } from '../../StateBase';

export abstract class ResOpState<
	TNodeDescr extends INodeDescrBase<TRes, TOp>,
	TRes extends IResourceBase<TOp>,
	TOp extends IOperationBase,
> extends StateBase {

	resource: TRes;
	operation: TOp;

	// from c-tor:
	nodeDescr: TNodeDescr;
	resourceName: string;
	operationName: string;

	constructor (
		execFns: IExecuteFunctions,
		nodeDescr: TNodeDescr,
		resourceName: string,
		opearationName: string,
	) {
		super(execFns);

		this.nodeDescr = nodeDescr;
		this.resourceName = resourceName;
		this.operationName = opearationName;

		this.resource = this.nodeDescr.resources[this.resourceName]
		this.operation = this.resource.operations[this.operationName];
	}
}
