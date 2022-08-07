# step4-1...step4-2 [compare](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step4-1...step4-2)

- [nodes/FakeCrm/FakeCrm.node.ts](#nodes/FakeCrm/FakeCrm.node.ts)
- [nodes/FakeCrm/backend/operations.ts](#nodes/FakeCrm/backend/operations.ts)

## nodes/FakeCrm/FakeCrm.node.ts<a name="nodes/FakeCrm/FakeCrm.node.ts"></a>

- [nodes/FakeCrm/FakeCrm.node.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/2e583788c20a30a22166f1c5e36c530ccd7c09c9/nodes%2FFakeCrm%2FFakeCrm.node.ts) modified [12,85,97] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/61b65ab15e4bfaeb3013e3375011844572ec2d59/nodes%2FFakeCrm%2FFakeCrm.node.ts)

```diff
@@ -7,6 +7,7 @@ import {
 	INodeExecutionData,
 	INodeType,
 	INodeTypeDescription,
+	NodeOperationError,
 } from 'n8n-workflow';
 
 
@@ -21,6 +22,7 @@ import { ResOpExecutor, ResOpResolver } from '@digital-boss/n8n-designpatterns/d
 import { ReturnParamsExecutor } from '@digital-boss/n8n-designpatterns/dist/usecases';
 import { getNodeExecFn, StateBase } from '@digital-boss/n8n-designpatterns/dist';
 import { fakeCrmRequest } from './GenericFunctions';
+import { operationMethods } from './backend/operations';
 
 const getTags = (param: IDataObject): string[] => {
 	return (param.tagProps as string[] || []).map((i: any) => i.tag)
@@ -69,93 +71,18 @@ export class FakeCrm implements INodeType {
 }
 
 const getItemExecutor = (execFns: IExecuteFunctions) => async (itemIndex: number): Promise<any> => {
-	const resource = execFns.getNodeParameter('resource', 0) as typeof resourcesConst[number];
-	const operation = execFns.getNodeParameter('operation', 0) as string;
+	const resourceName = execFns.getNodeParameter('resource', 0) as typeof resourcesConst[number];
+	const operationName = execFns.getNodeParameter('operation', 0) as string;
 
-	let method: string = 'GET';
-	let path: string = '/';
-	let body: IDataObject = {};
-
-	let id: string = '';
-	let postId: string = '';
-	let tags: string[] = [];
-
-	switch (resource) {
-		case "post":
-			switch (operation) {
-				case "create":
-					method = 'POST';
-					path = '/post';
-					const tagsColl1 = execFns.getNodeParameter('tags', itemIndex) as IDataObject;
-					tags = getTags(tagsColl1);
-					body = Object.assign({},
-						execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject,
-						{tags}
-					);
-					break;
-				case "update":
-					method = 'PUT';
-					id = execFns.getNodeParameter('id', itemIndex) as string;
-					path = `/post/${id}`;
-					const tagsColl2 = execFns.getNodeParameter('tags', itemIndex) as IDataObject;
-					tags = getTags(tagsColl2);
-					body = Object.assign({},
-						execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject,
-						{tags}
-					);
-					break;
-				case "get":
-					method = 'GET';
-					id = execFns.getNodeParameter('id', itemIndex) as string;
-					path = `/post/${id}`;
-					break;
-				case "getAll":
-					method = 'GET';
-					path = '/post';
-					break;
-				case "delete":
-					method = 'DELETE';
-					id = execFns.getNodeParameter('id', itemIndex) as string;
-					path = `/post/${id}`;
-					break;
-			}
-		break;
+	const resource = operationMethods[resourceName];
+	if (!resource) {
+		throw new NodeOperationError(execFns.getNode(), `Resource not found: ${resourceName}`);
+	}
 
-		case "comment":
-			switch (operation) {
-				case "create":
-					method = 'POST';
-					postId = execFns.getNodeParameter('postId', itemIndex) as string;
-					path = `/post/${postId}/comment`;
-					body = execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject;
-					break;
-				case "update":
-					method = 'PUT';
-					postId = execFns.getNodeParameter('postId', itemIndex) as string;
-					id = execFns.getNodeParameter('id', itemIndex) as string;
-					path = `/post/${postId}/comment/${id}`;
-					body = execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject;
-					break;
-				case "get":
-					method = 'GET';
-					postId = execFns.getNodeParameter('postId', itemIndex) as string;
-					id = execFns.getNodeParameter('id', itemIndex) as string;
-					path = `/post/${postId}/comment/${id}`;
-					break;
-				case "getAll":
-					method = 'GET';
-					postId = execFns.getNodeParameter('postId', itemIndex) as string;
-					path = `/post/${postId}/comment`;
-					break;
-				case "delete":
-					method = 'DELETE';
-					postId = execFns.getNodeParameter('postId', itemIndex) as string;
-					id = execFns.getNodeParameter('id', itemIndex) as string;
-					path = `/post/${postId}/comment/${id}`;
-					break;
-			}
-		break;
+	const operation = resource[operationName];
+	if (!operation) {
+		throw new NodeOperationError(execFns.getNode(), `Operation not found: ${operationName}`);
 	}
 
-	return await fakeCrmRequest.call(execFns, method, path, body) || {};
+	return operation(execFns, itemIndex);
 }
```

## nodes/FakeCrm/backend/operations.ts<a name="nodes/FakeCrm/backend/operations.ts"></a>

- [nodes/FakeCrm/backend/operations.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/2e583788c20a30a22166f1c5e36c530ccd7c09c9/nodes%2FFakeCrm%2Fbackend%2Foperations.ts) added [109,0,109]

```diff
@@ -0,0 +1,109 @@
+import {
+	IExecuteFunctions,
+} from 'n8n-core';
+
+import { IDataObject } from "n8n-workflow";
+import { fakeCrmRequest } from '../GenericFunctions';
+
+type OpFn = (execFns: IExecuteFunctions, itemIndex: number) => Promise<any>;
+type OpContainer = Record<string, OpFn>
+
+const getTags = (param: IDataObject): string[] => {
+	return (param.tagProps as string[] || []).map((i: any) => i.tag)
+}
+
+const post: OpContainer = {
+
+	create: (execFns, itemIndex) => {
+		const method = 'POST';
+		const path = '/post';
+		const tagsColl1 = execFns.getNodeParameter('tags', itemIndex) as IDataObject;
+		const tags = getTags(tagsColl1);
+		const body = Object.assign({},
+			execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject,
+			{tags}
+		);
+		return fakeCrmRequest.call(execFns, method, path, body)
+	},
+
+	update: (execFns, itemIndex) => {
+		const method = 'PUT';
+		const id = execFns.getNodeParameter('id', itemIndex) as string;
+		const path = `/post/${id}`;
+		const tagsColl2 = execFns.getNodeParameter('tags', itemIndex) as IDataObject;
+		const tags = getTags(tagsColl2);
+		const body = Object.assign({},
+			execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject,
+			{tags}
+		);
+		return fakeCrmRequest.call(execFns, method, path, body).then(res => res || {});
+	},
+
+	get: (execFns, itemIndex) => {
+		const method = 'GET';
+		const id = execFns.getNodeParameter('id', itemIndex) as string;
+		const path = `/post/${id}`;
+		return fakeCrmRequest.call(execFns, method, path)
+	},
+
+	getAll: (execFns, itemIndex) => {
+		const method = 'GET';
+		const path = '/post';
+		return fakeCrmRequest.call(execFns, method, path)
+	},
+
+	delete: (execFns, itemIndex) => {
+		const method = 'DELETE';
+		const id = execFns.getNodeParameter('id', itemIndex) as string;
+		const path = `/post/${id}`;
+		return fakeCrmRequest.call(execFns, method, path)
+	}
+}
+
+const comment: OpContainer = {
+
+	create: (execFns, itemIndex) => {
+		const method = 'POST';
+		const postId = execFns.getNodeParameter('postId', itemIndex) as string;
+		const path = `/post/${postId}/comment`;
+		const body = execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject;
+		return fakeCrmRequest.call(execFns, method, path, body)
+	},
+
+	update: (execFns, itemIndex) => {
+		const method = 'PUT';
+		const postId = execFns.getNodeParameter('postId', itemIndex) as string;
+		const id = execFns.getNodeParameter('id', itemIndex) as string;
+		const path = `/post/${postId}/comment/${id}`;
+		const body = execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject;
+		return fakeCrmRequest.call(execFns, method, path, body).then(res => res || {});
+	},
+
+	get: (execFns, itemIndex) => {
+		const method = 'GET';
+		const postId = execFns.getNodeParameter('postId', itemIndex) as string;
+		const id = execFns.getNodeParameter('id', itemIndex) as string;
+		const path = `/post/${postId}/comment/${id}`;
+		return fakeCrmRequest.call(execFns, method, path)
+	},
+
+	getAll:(execFns, itemIndex) => {
+		const method = 'GET';
+		const postId = execFns.getNodeParameter('postId', itemIndex) as string;
+		const path = `/post/${postId}/comment`;
+		return fakeCrmRequest.call(execFns, method, path)
+	},
+
+	delete: (execFns, itemIndex) => {
+		const method = 'DELETE';
+		const postId = execFns.getNodeParameter('postId', itemIndex) as string;
+		const id = execFns.getNodeParameter('id', itemIndex) as string;
+		const path = `/post/${postId}/comment/${id}`;
+		return fakeCrmRequest.call(execFns, method, path)
+	}
+}
+
+export const operationMethods = {
+	post,
+	comment
+}
```
