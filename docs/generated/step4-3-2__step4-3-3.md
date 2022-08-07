# step4-3-2...step4-3-3 [compare](https://api.github.com/repos/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step4-3-2...step4-3-3)

- [nodes/FakeCrm/FakeCrm.node.ts](#nodes/FakeCrm/FakeCrm.node.ts)
- [nodes/FakeCrm/backend/State.ts](#nodes/FakeCrm/backend/State.ts)
- [nodes/FakeCrm/backend/operations.ts](#nodes/FakeCrm/backend/operations.ts)
- [nodes/FakeCrm/descriptions/FakeCrm.description.yaml](#nodes/FakeCrm/descriptions/FakeCrm.description.yaml)
- [nodes/FakeCrm/descriptions/types.ts](#nodes/FakeCrm/descriptions/types.ts)

## nodes/FakeCrm/FakeCrm.node.ts<a name="nodes/FakeCrm/FakeCrm.node.ts"></a>

- [nodes/FakeCrm/FakeCrm.node.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/eef8ba9ebcbd4de67d4d337c2399efced3a45916/nodes%2FFakeCrm%2FFakeCrm.node.ts) modified [1,1,2] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/1847b527dc813de36fe3b7dc595d94cefc7acde8/nodes%2FFakeCrm%2FFakeCrm.node.ts)

```diff
@@ -79,7 +79,7 @@ const getItemExecutor = async (execFns: IExecuteFunctions) => {
 
 	const creds = await (execFns.getCredentials('fakeCrmApi')) as unknown as IFakeCrmApiCredentials
 	const httpClient = new HttpClientBasic(execFns.helpers.request, creds);
-	const state = new State(execFns);
+	const state = new State(execFns, nodeDescr, resourceName, operationName);
 
 	const resource = operationMethods[resourceName];
 	if (!resource) {
```

## nodes/FakeCrm/backend/State.ts<a name="nodes/FakeCrm/backend/State.ts"></a>

- [nodes/FakeCrm/backend/State.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/eef8ba9ebcbd4de67d4d337c2399efced3a45916/nodes%2FFakeCrm%2Fbackend%2FState.ts) modified [62,2,64] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/1847b527dc813de36fe3b7dc595d94cefc7acde8/nodes%2FFakeCrm%2Fbackend%2FState.ts)

```diff
@@ -4,11 +4,12 @@ import {
 } from 'request';
 import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
 import { IState } from './interfaces';
+import { INodeDescr, IOperation, IResource } from '../descriptions/types';
 
 /**
- * Access Node state, getting parameters.
+ * Base class for state
  */
-export class State implements IState {
+class StateBase implements IState {
 	itemIndex = 0;
 	execFns: IExecuteFunctions;
 
@@ -25,4 +26,63 @@ export class State implements IState {
 	getParam (name: string): any {
 		return this.execFns.getNodeParameter(name, this.itemIndex);
 	}
+
+	applyPathParams (path: string): string {
+		const rx = new RegExp('{[a-zA-Z_][a-zA-Z0-9]*}', 'g');
+		const matches = path.match(rx);
+		if (matches && matches.length > 0) {
+			matches.forEach((match, i) => {
+				const value = this.getParam(match.slice(1, -1)) as string;
+				if (value !== undefined) {
+					path = path.replace(match, value);
+				}
+			});
+		}
+		return path;
+	}
+}
+
+/**
+ * State for Resource-Operation Node
+ */
+abstract class ResOpState extends StateBase {
+
+	resource: IResource;
+	operation: IOperation;
+
+	// from c-tor:
+	nodeDescr: INodeDescr;
+	resourceName: string;
+	operationName: string;
+
+	constructor (
+		execFns: IExecuteFunctions,
+		nodeDescr: INodeDescr,
+		resourceName: string,
+		opearationName: string,
+	) {
+		super(execFns);
+
+		this.nodeDescr = nodeDescr;
+		this.resourceName = resourceName;
+		this.operationName = opearationName;
+
+		this.resource = this.nodeDescr.resources[this.resourceName]
+		this.operation = this.resource.operations[this.operationName];
+	}
+}
+
+/**
+ * Access Node state, getting parameters.
+ */
+ export class State extends ResOpState {
+
+	buildRequest (coreOpts: CoreOptions = {}): OptionsWithUri {
+		const pathWithValues = this.applyPathParams(this.operation.path);
+		return Object.assign({
+			method: this.operation.method,
+			uri: pathWithValues,
+			json: true,
+		}, coreOpts);
+	}
 }
```

## nodes/FakeCrm/backend/operations.ts<a name="nodes/FakeCrm/backend/operations.ts"></a>

- [nodes/FakeCrm/backend/operations.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/eef8ba9ebcbd4de67d4d337c2399efced3a45916/nodes%2FFakeCrm%2Fbackend%2Foperations.ts) modified [14,71,85] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/1847b527dc813de36fe3b7dc595d94cefc7acde8/nodes%2FFakeCrm%2Fbackend%2Foperations.ts)

```diff
@@ -16,115 +16,58 @@ const getTags = (param: IDataObject): string[] => {
 const post: OpContainer = {
 
 	create: (client, state) => {
-		const opts: OptionsWithUri = {
-			method: 'POST',
+		return client.request(state.buildRequest({
 			body: Object.assign({
 				tags: getTags(state.getParam('tags'))
 			}, state.getParam('additionalFields')),
-			uri: '/post',
-			json: true,
-		}
-		return client.request(opts);
+		}));
 	},
 
 	update: (client, state) => {
-		const id = state.getParam('id');
-		const opts: OptionsWithUri = {
-			method: 'PUT',
+		return client.request(state.buildRequest({
 			body: Object.assign({
 				tags: getTags(state.getParam('tags'))
 			}, state.getParam('additionalFields')),
-			uri: `/post/${id}`,
-			json: true,
-		}
-		return client.request(opts).then(res => res || {});
+		})).then(res => res || {});
 	},
 
 	get: (client, state) => {
-		const id = state.getParam('id');
-		const opts: OptionsWithUri = {
-			method: 'GET',
-			uri: `/post/${id}`,
-			json: true,
-		}
-		return client.request(opts);
+		return client.request(state.buildRequest());
 	},
 
 	getAll: (client, state) => {
-		const opts: OptionsWithUri = {
-			method: 'GET',
-			uri: `/post`,
-			json: true,
-		}
-		return client.request(opts);
+		return client.request(state.buildRequest());
 	},
 
 	delete: (client, state) => {
-		const id = state.getParam('id');
-		const opts: OptionsWithUri = {
-			method: 'DELETE',
-			uri: `/post/${id}`,
-			json: true,
-		}
-		return client.request(opts);
+		return client.request(state.buildRequest());
 	}
 }
 
 const comment: OpContainer = {
 
 	create: (client, state) => {
-		const postId = state.getParam('postId');
-		const opts: OptionsWithUri = {
-			method: 'POST',
+		return client.request(state.buildRequest({
 			body: state.getParam('additionalFields'),
-			uri: `/post/${postId}/comment`,
-			json: true,
-		}
-		return client.request(opts);
+		}));
 	},
 
 	update: (client, state) => {
-		const postId = state.getParam('postId');
-		const id = state.getParam('id');
-		const opts: OptionsWithUri = {
-			method: 'PUT',
+		return client.request(state.buildRequest({
 			body: state.getParam('additionalFields'),
-			uri: `/post/${postId}/comment/${id}`,
-			json: true,
-		}
-		return client.request(opts).then(res => res || {});
+		})).then(res => res || {});
 	},
 
 	get: (client, state) => {
-		const postId = state.getParam('postId');
-		const id = state.getParam('id');
-		const opts: OptionsWithUri = {
-			method: 'GET',
-			uri: `/post/${postId}/comment/${id}`,
-			json: true,
-		}
-		return client.request(opts);
+		return client.request(state.buildRequest());
 	},
 
 	getAll:(client, state) => {
-		const postId = state.getParam('postId');
-		const opts: OptionsWithUri = {
-			method: 'GET',
-			uri: `/post/${postId}/comment`,
-			json: true,
-		}
-		return client.request(opts);
+		return client.request(state.buildRequest());
 	},
 
 	delete: (client, state) => {
-		const postId = state.getParam('postId');
-		const id = state.getParam('id');
-		const opts: OptionsWithUri = {
-			method: 'DELETE',
-			uri: `/post/${postId}/comment/${id}`,
-			json: true,
-		}
-		return client.request(opts);
+		return client.request(state.buildRequest());
 	}
 }
 
```

## nodes/FakeCrm/descriptions/FakeCrm.description.yaml<a name="nodes/FakeCrm/descriptions/FakeCrm.description.yaml"></a>

- [nodes/FakeCrm/descriptions/FakeCrm.description.yaml](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/eef8ba9ebcbd4de67d4d337c2399efced3a45916/nodes%2FFakeCrm%2Fdescriptions%2FFakeCrm.description.yaml) modified [20,0,20] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/06e7eb5cb2927253d74abe775d55b527cfb3593a/nodes%2FFakeCrm%2Fdescriptions%2FFakeCrm.description.yaml)

```diff
@@ -5,6 +5,8 @@ resources:
     operations:
 
       create:
+        method: POST
+        path: /post
         params:
           - name: tags
             type: fixedCollection
@@ -22,6 +24,8 @@ resources:
               - Post.content
 
       update:
+        method: PUT
+        path: /post/{id}
         params:
           - Post.id
           - name: tags
@@ -40,13 +44,19 @@ resources:
               - Post.content
 
       get:
+        method: GET
+        path: /post/{id}
         params:
           - Post.id
 
       getAll:
+        method: GET
+        path: /post
         params: []
 
       delete:
+        method: DELETE
+        path: /post/{id}
         params:
           - Post.id
 
@@ -56,6 +66,8 @@ resources:
     operations:
 
       create:
+        method: POST
+        path: /post/{postId}/comment
         params:
           - Comment.postId
           - $link: cmn.additionalFields
@@ -65,6 +77,8 @@ resources:
               - Comment.content
 
       update:
+        method: PUT
+        path: /post/{postId}/comment/{id}
         params:
           - Comment.postId
           - Comment.id
@@ -75,15 +89,21 @@ resources:
               - Comment.content
 
       get:
+        method: GET
+        path: /post/{postId}/comment/{id}
         params:
           - Comment.postId
           - Comment.id
 
       getAll:
+        method: GET
+        path: /post/{postId}/comment
         params:
           - Comment.postId
 
       delete:
+        method: DELETE
+        path: /post/{postId}/comment/{id}
         params:
           - Comment.postId
           - Comment.id
```

## nodes/FakeCrm/descriptions/types.ts<a name="nodes/FakeCrm/descriptions/types.ts"></a>

- [nodes/FakeCrm/descriptions/types.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/eef8ba9ebcbd4de67d4d337c2399efced3a45916/nodes%2FFakeCrm%2Fdescriptions%2Ftypes.ts) modified [2,2,4] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/06e7eb5cb2927253d74abe775d55b527cfb3593a/nodes%2FFakeCrm%2Fdescriptions%2Ftypes.ts)

```diff
@@ -9,8 +9,8 @@ export interface IResource extends IResourceBase<IOperation> {
 }
 
 export interface IOperation extends IOperationBase {
-	method?: string;
-	path?: string;
+	method: string;
+	path: string;
 	responseMap?: string | string[];
 }
 
```
