# step4-3-1...step4-3-2 [compare](https://api.github.com/repos/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step4-3-1...step4-3-2)

- [nodes/FakeCrm/FakeCrm.node.ts](#nodes/FakeCrm/FakeCrm.node.ts)
- [nodes/FakeCrm/backend/State.ts](#nodes/FakeCrm/backend/State.ts)
- [nodes/FakeCrm/backend/interfaces.ts](#nodes/FakeCrm/backend/interfaces.ts)
- [nodes/FakeCrm/backend/operations.ts](#nodes/FakeCrm/backend/operations.ts)

## nodes/FakeCrm/FakeCrm.node.ts<a name="nodes/FakeCrm/FakeCrm.node.ts"></a>

- [nodes/FakeCrm/FakeCrm.node.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/1847b527dc813de36fe3b7dc595d94cefc7acde8/nodes%2FFakeCrm%2FFakeCrm.node.ts) modified [7,3,10] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/2eca392a2e62b3417933f9b797ab493e8dcf4074/nodes%2FFakeCrm%2FFakeCrm.node.ts)

```diff
@@ -24,6 +24,7 @@ import { getNodeExecFn, StateBase } from '@digital-boss/n8n-designpatterns/dist'
 import { operationMethods } from './backend/operations';
 import { HttpClientBasic } from './backend/HttpClientBasic';
 import { IFakeCrmApiCredentials } from 'credentials/FakeCrmApi.credentials';
+import { State } from './backend/State';
 
 const getTags = (param: IDataObject): string[] => {
 	return (param.tagProps as string[] || []).map((i: any) => i.tag)
@@ -73,11 +74,13 @@ export class FakeCrm implements INodeType {
 
 const getItemExecutor = async (execFns: IExecuteFunctions) => {
 
-	const creds = await (execFns.getCredentials('fakeCrmApi')) as unknown as IFakeCrmApiCredentials
-	const httpClient = new HttpClientBasic(execFns.helpers.request, creds)
 	const resourceName = execFns.getNodeParameter('resource', 0) as typeof resourcesConst[number];
 	const operationName = execFns.getNodeParameter('operation', 0) as string;
 
+	const creds = await (execFns.getCredentials('fakeCrmApi')) as unknown as IFakeCrmApiCredentials
+	const httpClient = new HttpClientBasic(execFns.helpers.request, creds);
+	const state = new State(execFns);
+
 	const resource = operationMethods[resourceName];
 	if (!resource) {
 		throw new NodeOperationError(execFns.getNode(), `Resource not found: ${resourceName}`);
@@ -89,6 +92,7 @@ const getItemExecutor = async (execFns: IExecuteFunctions) => {
 	}
 
 	return async (itemIndex: number): Promise<any> => {
-		return operation(httpClient, execFns, itemIndex);
+		state.updateIndex(itemIndex);
+		return operation(httpClient, state);
 	}
 }
```

## nodes/FakeCrm/backend/State.ts<a name="nodes/FakeCrm/backend/State.ts"></a>

- [nodes/FakeCrm/backend/State.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/1847b527dc813de36fe3b7dc595d94cefc7acde8/nodes%2FFakeCrm%2Fbackend%2FState.ts) added [28,0,28]

```diff
@@ -0,0 +1,28 @@
+import {
+	CoreOptions,
+	OptionsWithUri,
+} from 'request';
+import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
+import { IState } from './interfaces';
+
+/**
+ * Access Node state, getting parameters.
+ */
+export class State implements IState {
+	itemIndex = 0;
+	execFns: IExecuteFunctions;
+
+	constructor (
+		execFns: IExecuteFunctions,
+	) {
+		this.execFns = execFns;
+	}
+
+	updateIndex (itemIndex: number) {
+		this.itemIndex = itemIndex;
+	}
+
+	getParam (name: string): any {
+		return this.execFns.getNodeParameter(name, this.itemIndex);
+	}
+}
```

## nodes/FakeCrm/backend/interfaces.ts<a name="nodes/FakeCrm/backend/interfaces.ts"></a>

- [nodes/FakeCrm/backend/interfaces.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/1847b527dc813de36fe3b7dc595d94cefc7acde8/nodes%2FFakeCrm%2Fbackend%2Finterfaces.ts) modified [11,1,12] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/2eca392a2e62b3417933f9b797ab493e8dcf4074/nodes%2FFakeCrm%2Fbackend%2Finterfaces.ts)

```diff
@@ -3,6 +3,16 @@ import { OptionsWithUri } from 'request';
 /**
  * Makes HTTP requests
  */
- export interface IHttpClient {
+export interface IHttpClient {
 	request: (opts: OptionsWithUri) => Promise<any>;
 }
+
+/**
+ * Interface to implement for classes dependant on execution item index.
+ * For example, if class reads parameter: execFn.getNodeParameter('resource', itemIndex),
+ * then it depends on itemIndex
+ */
+export interface IState {
+	itemIndex: number;
+	updateIndex: (itemIndex: number) => void;
+}
```

## nodes/FakeCrm/backend/operations.ts<a name="nodes/FakeCrm/backend/operations.ts"></a>

- [nodes/FakeCrm/backend/operations.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/1847b527dc813de36fe3b7dc595d94cefc7acde8/nodes%2FFakeCrm%2Fbackend%2Foperations.ts) modified [31,36,67] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/2eca392a2e62b3417933f9b797ab493e8dcf4074/nodes%2FFakeCrm%2Fbackend%2Foperations.ts)

```diff
@@ -4,8 +4,9 @@ import {
 } from 'n8n-core';
 import { IDataObject } from "n8n-workflow";
 import { IHttpClient } from './interfaces';
+import { State } from './State';
 
-type OpFn = (client: IHttpClient, execFns: IExecuteFunctions, itemIndex: number) => Promise<any>;
+type OpFn = (client: IHttpClient, state: State) => Promise<any>;
 type OpContainer = Record<string, OpFn>
 
 const getTags = (param: IDataObject): string[] => {
@@ -14,39 +15,33 @@ const getTags = (param: IDataObject): string[] => {
 
 const post: OpContainer = {
 
-	create: (client, execFns, itemIndex) => {
-		const tagsColl = execFns.getNodeParameter('tags', itemIndex) as IDataObject;
-		const tags = getTags(tagsColl);
+	create: (client, state) => {
 		const opts: OptionsWithUri = {
 			method: 'POST',
-			body: Object.assign({},
-				execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject,
-				{tags}
-			),
+			body: Object.assign({
+				tags: getTags(state.getParam('tags'))
+			}, state.getParam('additionalFields')),
 			uri: '/post',
 			json: true,
 		}
 		return client.request(opts);
 	},
 
-	update: (client, execFns, itemIndex) => {
-		const id = execFns.getNodeParameter('id', itemIndex) as string;
-		const tagsColl = execFns.getNodeParameter('tags', itemIndex) as IDataObject;
-		const tags = getTags(tagsColl);
+	update: (client, state) => {
+		const id = state.getParam('id');
 		const opts: OptionsWithUri = {
 			method: 'PUT',
-			body: Object.assign({},
-				execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject,
-				{tags}
-			),
+			body: Object.assign({
+				tags: getTags(state.getParam('tags'))
+			}, state.getParam('additionalFields')),
 			uri: `/post/${id}`,
 			json: true,
 		}
 		return client.request(opts).then(res => res || {});
 	},
 
-	get: (client, execFns, itemIndex) => {
-		const id = execFns.getNodeParameter('id', itemIndex) as string;
+	get: (client, state) => {
+		const id = state.getParam('id');
 		const opts: OptionsWithUri = {
 			method: 'GET',
 			uri: `/post/${id}`,
@@ -55,7 +50,7 @@ const post: OpContainer = {
 		return client.request(opts);
 	},
 
-	getAll: (client, execFns, itemIndex) => {
+	getAll: (client, state) => {
 		const opts: OptionsWithUri = {
 			method: 'GET',
 			uri: `/post`,
@@ -64,8 +59,8 @@ const post: OpContainer = {
 		return client.request(opts);
 	},
 
-	delete: (client, execFns, itemIndex) => {
-		const id = execFns.getNodeParameter('id', itemIndex) as string;
+	delete: (client, state) => {
+		const id = state.getParam('id');
 		const opts: OptionsWithUri = {
 			method: 'DELETE',
 			uri: `/post/${id}`,
@@ -77,32 +72,32 @@ const post: OpContainer = {
 
 const comment: OpContainer = {
 
-	create: (client, execFns, itemIndex) => {
-		const postId = execFns.getNodeParameter('postId', itemIndex) as string;
+	create: (client, state) => {
+		const postId = state.getParam('postId');
 		const opts: OptionsWithUri = {
 			method: 'POST',
-			body: execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject,
+			body: state.getParam('additionalFields'),
 			uri: `/post/${postId}/comment`,
 			json: true,
 		}
 		return client.request(opts);
 	},
 
-	update: (client, execFns, itemIndex) => {
-		const postId = execFns.getNodeParameter('postId', itemIndex) as string;
-		const id = execFns.getNodeParameter('id', itemIndex) as string;
+	update: (client, state) => {
+		const postId = state.getParam('postId');
+		const id = state.getParam('id');
 		const opts: OptionsWithUri = {
 			method: 'PUT',
-			body: execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject,
+			body: state.getParam('additionalFields'),
 			uri: `/post/${postId}/comment/${id}`,
 			json: true,
 		}
 		return client.request(opts).then(res => res || {});
 	},
 
-	get: (client, execFns, itemIndex) => {
-		const postId = execFns.getNodeParameter('postId', itemIndex) as string;
-		const id = execFns.getNodeParameter('id', itemIndex) as string;
+	get: (client, state) => {
+		const postId = state.getParam('postId');
+		const id = state.getParam('id');
 		const opts: OptionsWithUri = {
 			method: 'GET',
 			uri: `/post/${postId}/comment/${id}`,
@@ -111,8 +106,8 @@ const comment: OpContainer = {
 		return client.request(opts);
 	},
 
-	getAll:(client, execFns, itemIndex) => {
-		const postId = execFns.getNodeParameter('postId', itemIndex) as string;
+	getAll:(client, state) => {
+		const postId = state.getParam('postId');
 		const opts: OptionsWithUri = {
 			method: 'GET',
 			uri: `/post/${postId}/comment`,
@@ -121,9 +116,9 @@ const comment: OpContainer = {
 		return client.request(opts);
 	},
 
-	delete: (client, execFns, itemIndex) => {
-		const postId = execFns.getNodeParameter('postId', itemIndex) as string;
-		const id = execFns.getNodeParameter('id', itemIndex) as string;
+	delete: (client, state) => {
+		const postId = state.getParam('postId');
+		const id = state.getParam('id');
 		const opts: OptionsWithUri = {
 			method: 'DELETE',
 			uri: `/post/${postId}/comment/${id}`,
```
