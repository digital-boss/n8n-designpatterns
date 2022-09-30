import { IHttpRequestOptions } from 'n8n-workflow';

/**
 * Makes HTTP requests
 */
export interface IHttpClient {
	request: (opts: IHttpRequestOptions) => Promise<any>;
}

export type ItemExecFn = (itemIndex: number) => Promise<any>;

/**
 * Interface to implement for classes dependent on execution item index.
 * For example, if class reads parameter: execFn.getNodeParameter('resource', itemIndex),
 * then it depends on itemIndex
 */
export interface IState {
	itemIndex: number;
	updateIndex: (itemIndex: number) => void;
}

export interface IOperationResolver<TOpFn> {
	getOperationMethod: () => TOpFn;
}
