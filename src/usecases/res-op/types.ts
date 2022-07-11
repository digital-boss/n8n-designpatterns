import { INodeProperties } from 'n8n-workflow';


/**
 * Base type for Node Description
 */
export interface INodeDescrBase<
	TRes extends IResourceBase<TOp>,
	TOp extends IOperationBase,
> {
	resources: Record<string, TRes>;
	models: Record<string, Array<Partial<INodeProperties>>>;
}

export interface IResourceBase<TOp extends IOperationBase> {
	operations: Record<string, TOp>;
	display?: string;
	defaultOperation?: string;
}

export interface IOperationBase {
	params: INodeProperties[];
	display?: string;
	/**
	 * true for operations for which backend logic is not implemented yet. This operations will not be generated for UI.
	 */
	notImplemented?: boolean;
	desc?: string;
}


/**
 * Type names to mark objects (nodes) inside Node Description object
 */
export type TypeName = 'Root' | 'Resource' | 'Operation' | 'Param' | 'Option' | 'PropCollection';
