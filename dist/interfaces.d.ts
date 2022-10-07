import { IHttpRequestOptions } from 'n8n-workflow';
export interface IHttpClient {
    request: (opts: IHttpRequestOptions) => Promise<any>;
}
export declare type ItemExecFn = (itemIndex: number) => Promise<any>;
export interface IState {
    itemIndex: number;
    updateIndex: (itemIndex: number) => void;
}
export interface IOperationResolver<TOpFn> {
    getOperationMethod: () => TOpFn;
}
