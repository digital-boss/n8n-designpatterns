import { IHttpClient } from '../interfaces';
import {
	IDataObject,
	IHttpRequestOptions
} from 'n8n-workflow';

export interface IBasicAuth {
	url: string;
	username: string;
	password: string;
}

type RequestFn = (urlOrObject: string | IDataObject | any, options?: IDataObject) => Promise<any>;

const normalizeUrl = (url: string) => url.endsWith('/') ? url.slice(0, -1) : url;

/**
 * HTTP Client with Basic authorization
 */
export class HttpClientBasic implements IHttpClient {

	private token: string;
	private url: string;

	constructor(private requestFn: RequestFn, private creds: IBasicAuth) {
		this.token = Buffer.from(`${this.creds.username}:${this.creds.password}`).toString('base64')
		this.url = normalizeUrl(this.creds.url);
	}

	request (options: IHttpRequestOptions) {
		options.headers!['Authorization'] = `Basic ${this.token}`;
		return this.requestFn(Object.assign({}, options, { url: this.url + options.url }));
	};
}
