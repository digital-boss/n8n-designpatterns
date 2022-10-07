import { IHttpClient } from '../interfaces';
import { IDataObject, IHttpRequestOptions } from 'n8n-workflow';
export interface IBasicAuth {
    url: string;
    username: string;
    password: string;
}
declare type RequestFn = (urlOrObject: string | IDataObject | any, options?: IDataObject) => Promise<any>;
export declare class HttpClientBasic implements IHttpClient {
    private requestFn;
    private creds;
    private token;
    private url;
    constructor(requestFn: RequestFn, creds: IBasicAuth);
    request(options: IHttpRequestOptions): Promise<any>;
}
export {};
