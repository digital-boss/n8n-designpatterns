import {
	CoreOptions,
	OptionsWithUri,
} from 'request';

/**
 * Makes HTTP requests
 */
export interface IHttpClient {
	request: (opts: OptionsWithUri) => Promise<any>;
}

export type ItemExecFn = (itemIndex: number) => Promise<any>;

/**
 * Interface to implement for classes dependant on execution item index.
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
