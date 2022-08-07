# step3-2...step4-1 [compare](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step3-2...step4-1)

- [nodes/FakeCrm/FakeCrm.node.ts](#nodes/FakeCrm/FakeCrm.node.ts)
- [nodes/FakeCrm/backend/getNodeExecFn.ts](#nodes/FakeCrm/backend/getNodeExecFn.ts)

## nodes/FakeCrm/FakeCrm.node.ts<a name="nodes/FakeCrm/FakeCrm.node.ts"></a>

- [nodes/FakeCrm/FakeCrm.node.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/61b65ab15e4bfaeb3013e3375011844572ec2d59/nodes%2FFakeCrm%2FFakeCrm.node.ts) modified [91,113,204] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/13f50acf40a51076ea7960a3b44228a30b52d6e0/nodes%2FFakeCrm%2FFakeCrm.node.ts)

```diff
@@ -61,123 +61,101 @@ export class FakeCrm implements INodeType {
 	};
 
 	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
+		const execItemFn = getItemExecutor(this)
+		const nodeExec = getNodeExecFn(execItemFn);
+		return nodeExec.call(this);
+	}
 
-		// Uncomment following lines to output app parameters with values as node execution result. Can be helpfull in debugging.
-		// const params0 = this.getNode().parameters;
-		// const paramsWithValues0 = Object.keys(params0).map(name => [name, this.getNodeParameter(name, 0)]);
-		// const res0 = Object.fromEntries(paramsWithValues0);
-		// return [this.helpers.returnJsonArray(res0)];
-
-		const items = this.getInputData();
-		const length = items.length;
-		const returnData: IDataObject[] = [];
-		const resource = this.getNodeParameter('resource', 0) as typeof resourcesConst[number];
-		const operation = this.getNodeParameter('operation', 0) as string;
-
-		for (let itemIndex = 0; itemIndex < length; itemIndex++) {
-			try {
-				let method: string = 'GET';
-				let path: string = '/';
-				let body: IDataObject = {};
-
-				let id: string = '';
-				let postId: string = '';
-				let tags: string[] = [];
+}
 
-				switch (resource) {
-					case "post":
-						switch (operation) {
-							case "create":
-								method = 'POST';
-								path = '/post';
-								const tagsColl1 = this.getNodeParameter('tags', itemIndex) as IDataObject;
-								tags = getTags(tagsColl1);
-								body = Object.assign({},
-									this.getNodeParameter('additionalFields', itemIndex) as IDataObject,
-									{tags}
-								);
-								break;
-							case "update":
-								method = 'PUT';
-								id = this.getNodeParameter('id', itemIndex) as string;
-								path = `/post/${id}`;
-								const tagsColl2 = this.getNodeParameter('tags', itemIndex) as IDataObject;
-								tags = getTags(tagsColl2);
-								body = Object.assign({},
-									this.getNodeParameter('additionalFields', itemIndex) as IDataObject,
-									{tags}
-								);
-								break;
-							case "get":
-								method = 'GET';
-								id = this.getNodeParameter('id', itemIndex) as string;
-								path = `/post/${id}`;
-								break;
-							case "getAll":
-								method = 'GET';
-								path = '/post';
-								break;
-							case "delete":
-								method = 'DELETE';
-								id = this.getNodeParameter('id', itemIndex) as string;
-								path = `/post/${id}`;
-								break;
-						}
+const getItemExecutor = (execFns: IExecuteFunctions) => async (itemIndex: number): Promise<any> => {
+	const resource = execFns.getNodeParameter('resource', 0) as typeof resourcesConst[number];
+	const operation = execFns.getNodeParameter('operation', 0) as string;
+
+	let method: string = 'GET';
+	let path: string = '/';
+	let body: IDataObject = {};
+
+	let id: string = '';
+	let postId: string = '';
+	let tags: string[] = [];
+
+	switch (resource) {
+		case "post":
+			switch (operation) {
+				case "create":
+					method = 'POST';
+					path = '/post';
+					const tagsColl1 = execFns.getNodeParameter('tags', itemIndex) as IDataObject;
+					tags = getTags(tagsColl1);
+					body = Object.assign({},
+						execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject,
+						{tags}
+					);
 					break;
-
-					case "comment":
-						switch (operation) {
-							case "create":
-								method = 'POST';
-								postId = this.getNodeParameter('postId', itemIndex) as string;
-								path = `/post/${postId}/comment`;
-								body = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
-								break;
-							case "update":
-								method = 'PUT';
-								postId = this.getNodeParameter('postId', itemIndex) as string;
-								id = this.getNodeParameter('id', itemIndex) as string;
-								path = `/post/${postId}/comment/${id}`;
-								body = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
-								break;
-							case "get":
-								method = 'GET';
-								postId = this.getNodeParameter('postId', itemIndex) as string;
-								id = this.getNodeParameter('id', itemIndex) as string;
-								path = `/post/${postId}/comment/${id}`;
-								break;
-							case "getAll":
-								method = 'GET';
-								postId = this.getNodeParameter('postId', itemIndex) as string;
-								path = `/post/${postId}/comment`;
-								break;
-							case "delete":
-								method = 'DELETE';
-								postId = this.getNodeParameter('postId', itemIndex) as string;
-								id = this.getNodeParameter('id', itemIndex) as string;
-								path = `/post/${postId}/comment/${id}`;
-								break;
-						}
+				case "update":
+					method = 'PUT';
+					id = execFns.getNodeParameter('id', itemIndex) as string;
+					path = `/post/${id}`;
+					const tagsColl2 = execFns.getNodeParameter('tags', itemIndex) as IDataObject;
+					tags = getTags(tagsColl2);
+					body = Object.assign({},
+						execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject,
+						{tags}
+					);
+					break;
+				case "get":
+					method = 'GET';
+					id = execFns.getNodeParameter('id', itemIndex) as string;
+					path = `/post/${id}`;
+					break;
+				case "getAll":
+					method = 'GET';
+					path = '/post';
+					break;
+				case "delete":
+					method = 'DELETE';
+					id = execFns.getNodeParameter('id', itemIndex) as string;
+					path = `/post/${id}`;
 					break;
-				}
-
-				const result = await fakeCrmRequest.call(this, method, path, body) || {};
-
-				if (result.constructor === Array) {
-					returnData.push.apply(returnData, result);
-				} else {
-					returnData.push(result);
-				}
-			} catch (error) {
-				if (this.continueOnFail()) {
-					returnData.push({ error: error.message });
-					continue;
-				}
-				throw error;
 			}
-		}
-
-		return [this.helpers.returnJsonArray(returnData)];
+		break;
+
+		case "comment":
+			switch (operation) {
+				case "create":
+					method = 'POST';
+					postId = execFns.getNodeParameter('postId', itemIndex) as string;
+					path = `/post/${postId}/comment`;
+					body = execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject;
+					break;
+				case "update":
+					method = 'PUT';
+					postId = execFns.getNodeParameter('postId', itemIndex) as string;
+					id = execFns.getNodeParameter('id', itemIndex) as string;
+					path = `/post/${postId}/comment/${id}`;
+					body = execFns.getNodeParameter('additionalFields', itemIndex) as IDataObject;
+					break;
+				case "get":
+					method = 'GET';
+					postId = execFns.getNodeParameter('postId', itemIndex) as string;
+					id = execFns.getNodeParameter('id', itemIndex) as string;
+					path = `/post/${postId}/comment/${id}`;
+					break;
+				case "getAll":
+					method = 'GET';
+					postId = execFns.getNodeParameter('postId', itemIndex) as string;
+					path = `/post/${postId}/comment`;
+					break;
+				case "delete":
+					method = 'DELETE';
+					postId = execFns.getNodeParameter('postId', itemIndex) as string;
+					id = execFns.getNodeParameter('id', itemIndex) as string;
+					path = `/post/${postId}/comment/${id}`;
+					break;
+			}
+		break;
 	}
-}
 
+	return await fakeCrmRequest.call(execFns, method, path, body) || {};
+}
```

## nodes/FakeCrm/backend/getNodeExecFn.ts<a name="nodes/FakeCrm/backend/getNodeExecFn.ts"></a>

- [nodes/FakeCrm/backend/getNodeExecFn.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/61b65ab15e4bfaeb3013e3375011844572ec2d59/nodes%2FFakeCrm%2Fbackend%2FgetNodeExecFn.ts) added [25,0,25]

```diff
@@ -0,0 +1,25 @@
+import { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
+
+export const getNodeExecFn = (execItem: (itemIndex: number) => Promise<any>) => async function (this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
+	const items = this.getInputData();
+	const length = items.length;
+	const returnData: IDataObject[] = [];
+
+	for (let itemIndex = 0; itemIndex < length; itemIndex++) {
+		try {
+			const result = await execItem(itemIndex);
+			if (result.constructor === Array) {
+				returnData.push.apply(returnData, result);
+			} else {
+				returnData.push(result);
+			}
+		} catch (error) {
+			if (this.continueOnFail()) {
+				returnData.push({ error: error.message });
+				continue;
+			}
+			throw error;
+		}
+	}
+	return [this.helpers.returnJsonArray(returnData)];
+};
```
