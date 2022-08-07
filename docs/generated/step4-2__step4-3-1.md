# step4-2...step4-3-1 [compare](https://api.github.com/repos/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step4-2...step4-3-1)

- [credentials/FakeCrmApi.credentials.ts](#credentials/FakeCrmApi.credentials.ts)
- [nodes/FakeCrm/FakeCrm.node.ts](#nodes/FakeCrm/FakeCrm.node.ts)
- [nodes/FakeCrm/GenericFunctions.ts](#nodes/FakeCrm/GenericFunctions.ts)
- [nodes/FakeCrm/backend/HttpClientBasic.ts](#nodes/FakeCrm/backend/HttpClientBasic.ts)
- [nodes/FakeCrm/backend/interfaces.ts](#nodes/FakeCrm/backend/interfaces.ts)
- [nodes/FakeCrm/backend/operations.ts](#nodes/FakeCrm/backend/operations.ts)

## credentials/FakeCrmApi.credentials.ts<a name="credentials/FakeCrmApi.credentials.ts"></a>

- [credentials/FakeCrmApi.credentials.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/2eca392a2e62b3417933f9b797ab493e8dcf4074/credentials%2FFakeCrmApi.credentials.ts) modified [19,2,21] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/06e7eb5cb2927253d74abe775d55b527cfb3593a/credentials%2FFakeCrmApi.credentials.ts)

```diff
@@ -4,7 +4,9 @@ import {
 } from 'n8n-workflow';
 
 export interface IFakeCrmApiCredentials {
-	host: string;
+	url: string;
+	username: string;
+	password: string;
 }
 
 export class FakeCrmApi implements ICredentialType {
@@ -14,9 +16,24 @@ export class FakeCrmApi implements ICredentialType {
 	properties: INodeProperties[] = [
 		{
 			displayName: 'Host',
-			name: 'host',
+			name: 'url',
 			type: 'string',
 			default: 'http://localhost:3000',
 		},
+		{
+			displayName: 'User',
+			name: 'user',
+			type: 'string',
+			default: '',
+		},
+		{
+			displayName: 'Passsword',
+			name: 'password',
+			type: 'string',
+			typeOptions: {
+				password: true,
+			},
+			default: '',
+		},
 	];
 }
```

## nodes/FakeCrm/FakeCrm.node.ts<a name="nodes/FakeCrm/FakeCrm.node.ts"></a>

- [nodes/FakeCrm/FakeCrm.node.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/2eca392a2e62b3417933f9b797ab493e8dcf4074/nodes%2FFakeCrm%2FFakeCrm.node.ts) modified [10,4,14] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/2e583788c20a30a22166f1c5e36c530ccd7c09c9/nodes%2FFakeCrm%2FFakeCrm.node.ts)

```diff
@@ -21,8 +21,9 @@ import { resourcesConst } from './descriptions/generated/resourceOperations';
 import { ResOpExecutor, ResOpResolver } from '@digital-boss/n8n-designpatterns/dist/usecases/res-op';
 import { ReturnParamsExecutor } from '@digital-boss/n8n-designpatterns/dist/usecases';
 import { getNodeExecFn, StateBase } from '@digital-boss/n8n-designpatterns/dist';
-import { fakeCrmRequest } from './GenericFunctions';
 import { operationMethods } from './backend/operations';
+import { HttpClientBasic } from './backend/HttpClientBasic';
+import { IFakeCrmApiCredentials } from 'credentials/FakeCrmApi.credentials';
 
 const getTags = (param: IDataObject): string[] => {
 	return (param.tagProps as string[] || []).map((i: any) => i.tag)
@@ -63,14 +64,17 @@ export class FakeCrm implements INodeType {
 	};
 
 	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
-		const execItemFn = getItemExecutor(this)
+		const execItemFn = await getItemExecutor(this)
 		const nodeExec = getNodeExecFn(execItemFn);
 		return nodeExec.call(this);
 	}
 
 }
 
-const getItemExecutor = (execFns: IExecuteFunctions) => async (itemIndex: number): Promise<any> => {
+const getItemExecutor = async (execFns: IExecuteFunctions) => {
+
+	const creds = await (execFns.getCredentials('fakeCrmApi')) as unknown as IFakeCrmApiCredentials
+	const httpClient = new HttpClientBasic(execFns.helpers.request, creds)
 	const resourceName = execFns.getNodeParameter('resource', 0) as typeof resourcesConst[number];
 	const operationName = execFns.getNodeParameter('operation', 0) as string;
 
@@ -84,5 +88,7 @@ const getItemExecutor = (execFns: IExecuteFunctions) => async (itemIndex: number
 		throw new NodeOperationError(execFns.getNode(), `Operation not found: ${operationName}`);
 	}
 
-	return operation(execFns, itemIndex);
+	return async (itemIndex: number): Promise<any> => {
+		return operation(httpClient, execFns, itemIndex);
+	}
 }
```

## nodes/FakeCrm/GenericFunctions.ts<a name="nodes/FakeCrm/GenericFunctions.ts"></a>

- [nodes/FakeCrm/GenericFunctions.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/2e583788c20a30a22166f1c5e36c530ccd7c09c9/nodes%2FFakeCrm%2FGenericFunctions.ts) removed [0,45,45] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/13f50acf40a51076ea7960a3b44228a30b52d6e0/nodes%2FFakeCrm%2FGenericFunctions.ts)

```diff
@@ -1,45 +0,0 @@
-import { OptionsWithUri } from "request";
-
-import {
-	IExecuteFunctions,
-	IExecuteSingleFunctions,
-	IHookFunctions,
-	ILoadOptionsFunctions,
-} from "n8n-core";
-
-import { IDataObject, NodeApiError, NodeOperationError } from "n8n-workflow";
-import { IFakeCrmApiCredentials } from "credentials/FakeCrmApi.credentials";
-
-export async function fakeCrmRequest(
-	this:
-		| IHookFunctions
-		| IExecuteFunctions
-		| IExecuteSingleFunctions
-		| ILoadOptionsFunctions,
-	method: string,
-	path: string,
-	body: object = {},
-): Promise<any> {
-
-	const creds = (await this.getCredentials("fakeCrmApi")) as unknown as IFakeCrmApiCredentials;
-
-	if (creds === undefined) {
-		throw new NodeOperationError(
-			this.getNode(),
-			"No credentials got returned!"
-		);
-	}
-
-	const options: OptionsWithUri = {
-		method,
-		body,
-		uri: creds.host + path,
-		json: true,
-	};
-
-	try {
-		return this.helpers.request!(options);
-	} catch (error) {
-		throw new NodeApiError(this.getNode(), error);
-	}
-}
```

## nodes/FakeCrm/backend/HttpClientBasic.ts<a name="nodes/FakeCrm/backend/HttpClientBasic.ts"></a>

- [nodes/FakeCrm/backend/HttpClientBasic.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/2eca392a2e62b3417933f9b797ab493e8dcf4074/nodes%2FFakeCrm%2Fbackend%2FHttpClientBasic.ts) added [33,0,33]

```diff
@@ -0,0 +1,33 @@
+import { IDataObject } from 'n8n-workflow';
+import { OptionsWithUri } from 'request';
+import { IHttpClient } from './interfaces';
+
+export interface IBasicAuth {
+	url: string;
+	username: string;
+	password: string;
+}
+
+type RequestFn = (uriOrObject: string | IDataObject | any, options?: IDataObject) => Promise<any>;
+
+const normalizeUrl = (url: string) => url.endsWith('/') ? url.slice(0, -1) : url;
+
+/**
+ * HTTP Client with Basic authorization
+ */
+export class HttpClientBasic implements IHttpClient {
+
+	private token: string;
+	private url: string;
+
+	constructor(private requestFn: RequestFn, private creds: IBasicAuth) {
+		this.token = Buffer.from(`${this.creds.username}:${this.creds.password}`).toString('base64')
+		this.url = normalizeUrl(this.creds.url);
+	}
+
+	request (options: OptionsWithUri) {
+		options.headers = options.headers || {};
+		options.headers.Authorization = options.headers.Authorization || `Basic ${this.token}`;
+		return this.requestFn(Object.assign({}, options, { uri: this.url + options.uri }));
+	};
+}
```

## nodes/FakeCrm/backend/interfaces.ts<a name="nodes/FakeCrm/backend/interfaces.ts"></a>

- [nodes/FakeCrm/backend/interfaces.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/2eca392a2e62b3417933f9b797ab493e8dcf4074/nodes%2FFakeCrm%2Fbackend%2Finterfaces.ts) added [8,0,8]

```diff
@@ -0,0 +1,8 @@
+import { OptionsWithUri } from 'request';
+
+/**
+ * Makes HTTP requests
+ */
+ export interface IHttpClient {
+	request: (opts: OptionsWithUri) => Promise<any>;
+}
```

## nodes/FakeCrm/backend/operations.ts<a name="nodes/FakeCrm/backend/operations.ts"></a>

- [nodes/FakeCrm/backend/operations.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/2eca392a2e62b3417933f9b797ab493e8dcf4074/nodes%2FFakeCrm%2Fbackend%2Foperations.ts) modified [87,57,144] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/2e583788c20a30a22166f1c5e36c530ccd7c09c9/nodes%2FFakeCrm%2Fbackend%2Foperations.ts)

```diff
@@ -1,11 +1,11 @@
+import { OptionsWithUri } from 'request';
 import {
 	IExecuteFunctions,
 } from 'n8n-core';
-
 import { IDataObject } from "n8n-workflow";
-import { fakeCrmRequest } from '../GenericFunctions';
+import { IHttpClient } from './interfaces';
 
-type OpFn = (execFns: IExecuteFunctions, itemIndex: number) => Promise<any>;
+type OpFn = (client: IHttpClient, execFns: IExecuteFunctions, itemIndex: number) => Promise<any>;
 type OpContainer = Record<string, OpFn>
 
 const getTags = (param: IDataObject): string[] => {
@@ -14,92 +14,122 @@ const getTags = (param: IDataObject): string[] => {
 
 const post: OpContainer = {
 
-	create: (execFns, itemIndex) => {
-		const method = 'POST';
-		const path = '/post';
-		const tagsColl1 = execFns.getNodeParameter('tags', itemIndex) as IDataObject;
-		const tags = getTags(tagsColl1);
-		const body = Object.assign({},
-			execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject,
-			{tags}
-		);
-		return fakeCrmRequest.call(execFns, method, path, body)
+	create: (client, execFns, itemIndex) => {
+		const tagsColl = execFns.getNodeParameter('tags', itemIndex) as IDataObject;
+		const tags = getTags(tagsColl);
+		const opts: OptionsWithUri = {
+			method: 'POST',
+			body: Object.assign({},
+				execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject,
+				{tags}
+			),
+			uri: '/post',
+			json: true,
+		}
+		return client.request(opts);
 	},
 
-	update: (execFns, itemIndex) => {
-		const method = 'PUT';
+	update: (client, execFns, itemIndex) => {
 		const id = execFns.getNodeParameter('id', itemIndex) as string;
-		const path = `/post/${id}`;
-		const tagsColl2 = execFns.getNodeParameter('tags', itemIndex) as IDataObject;
-		const tags = getTags(tagsColl2);
-		const body = Object.assign({},
-			execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject,
-			{tags}
-		);
-		return fakeCrmRequest.call(execFns, method, path, body).then(res => res || {});
+		const tagsColl = execFns.getNodeParameter('tags', itemIndex) as IDataObject;
+		const tags = getTags(tagsColl);
+		const opts: OptionsWithUri = {
+			method: 'PUT',
+			body: Object.assign({},
+				execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject,
+				{tags}
+			),
+			uri: `/post/${id}`,
+			json: true,
+		}
+		return client.request(opts).then(res => res || {});
 	},
 
-	get: (execFns, itemIndex) => {
-		const method = 'GET';
+	get: (client, execFns, itemIndex) => {
 		const id = execFns.getNodeParameter('id', itemIndex) as string;
-		const path = `/post/${id}`;
-		return fakeCrmRequest.call(execFns, method, path)
+		const opts: OptionsWithUri = {
+			method: 'GET',
+			uri: `/post/${id}`,
+			json: true,
+		}
+		return client.request(opts);
 	},
 
-	getAll: (execFns, itemIndex) => {
-		const method = 'GET';
-		const path = '/post';
-		return fakeCrmRequest.call(execFns, method, path)
+	getAll: (client, execFns, itemIndex) => {
+		const opts: OptionsWithUri = {
+			method: 'GET',
+			uri: `/post`,
+			json: true,
+		}
+		return client.request(opts);
 	},
 
-	delete: (execFns, itemIndex) => {
-		const method = 'DELETE';
+	delete: (client, execFns, itemIndex) => {
 		const id = execFns.getNodeParameter('id', itemIndex) as string;
-		const path = `/post/${id}`;
-		return fakeCrmRequest.call(execFns, method, path)
+		const opts: OptionsWithUri = {
+			method: 'DELETE',
+			uri: `/post/${id}`,
+			json: true,
+		}
+		return client.request(opts);
 	}
 }
 
 const comment: OpContainer = {
 
-	create: (execFns, itemIndex) => {
-		const method = 'POST';
+	create: (client, execFns, itemIndex) => {
 		const postId = execFns.getNodeParameter('postId', itemIndex) as string;
-		const path = `/post/${postId}/comment`;
-		const body = execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject;
-		return fakeCrmRequest.call(execFns, method, path, body)
+		const opts: OptionsWithUri = {
+			method: 'POST',
+			body: execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject,
+			uri: `/post/${postId}/comment`,
+			json: true,
+		}
+		return client.request(opts);
 	},
 
-	update: (execFns, itemIndex) => {
-		const method = 'PUT';
+	update: (client, execFns, itemIndex) => {
 		const postId = execFns.getNodeParameter('postId', itemIndex) as string;
 		const id = execFns.getNodeParameter('id', itemIndex) as string;
-		const path = `/post/${postId}/comment/${id}`;
-		const body = execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject;
-		return fakeCrmRequest.call(execFns, method, path, body).then(res => res || {});
+		const opts: OptionsWithUri = {
+			method: 'PUT',
+			body: execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject,
+			uri: `/post/${postId}/comment/${id}`,
+			json: true,
+		}
+		return client.request(opts).then(res => res || {});
 	},
 
-	get: (execFns, itemIndex) => {
-		const method = 'GET';
+	get: (client, execFns, itemIndex) => {
 		const postId = execFns.getNodeParameter('postId', itemIndex) as string;
 		const id = execFns.getNodeParameter('id', itemIndex) as string;
-		const path = `/post/${postId}/comment/${id}`;
-		return fakeCrmRequest.call(execFns, method, path)
+		const opts: OptionsWithUri = {
+			method: 'GET',
+			uri: `/post/${postId}/comment/${id}`,
+			json: true,
+		}
+		return client.request(opts);
 	},
 
-	getAll:(execFns, itemIndex) => {
-		const method = 'GET';
+	getAll:(client, execFns, itemIndex) => {
 		const postId = execFns.getNodeParameter('postId', itemIndex) as string;
-		const path = `/post/${postId}/comment`;
-		return fakeCrmRequest.call(execFns, method, path)
+		const opts: OptionsWithUri = {
+			method: 'GET',
+			uri: `/post/${postId}/comment`,
+			json: true,
+		}
+		return client.request(opts);
 	},
 
-	delete: (execFns, itemIndex) => {
-		const method = 'DELETE';
+	delete: (client, execFns, itemIndex) => {
 		const postId = execFns.getNodeParameter('postId', itemIndex) as string;
 		const id = execFns.getNodeParameter('id', itemIndex) as string;
-		const path = `/post/${postId}/comment/${id}`;
-		return fakeCrmRequest.call(execFns, method, path)
+		const opts: OptionsWithUri = {
+			method: 'DELETE',
+			uri: `/post/${postId}/comment/${id}`,
+			json: true,
+		}
+		return client.request(opts);
 	}
 }
 
```
