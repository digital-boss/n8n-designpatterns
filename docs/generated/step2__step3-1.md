# step2...step3-1 [compare](https://api.github.com/repos/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step2...step3-1)

- [nodes/FakeCrm/FakeCrm.node.ts](#nodes/FakeCrm/FakeCrm.node.ts)

## nodes/FakeCrm/FakeCrm.node.ts<a name="nodes/FakeCrm/FakeCrm.node.ts"></a>

- [nodes/FakeCrm/FakeCrm.node.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/23518e90acee841708f2ea035012defd527f7268/nodes%2FFakeCrm%2FFakeCrm.node.ts) modified [62,8,70] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/06e7eb5cb2927253d74abe775d55b527cfb3593a/nodes%2FFakeCrm%2FFakeCrm.node.ts)

```diff
@@ -3,6 +3,7 @@ import {
 } from 'n8n-core';
 
 import {
+	IDataObject,
 	INodeExecutionData,
 	INodeType,
 	INodeTypeDescription,
@@ -56,18 +57,71 @@ export class FakeCrm implements INodeType {
 	};
 
 	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
+		const items = this.getInputData();
+		const length = items.length;
+		const returnData: IDataObject[] = [];
 		const resource = this.getNodeParameter('resource', 0) as typeof resourcesConst[number];
 		const operation = this.getNodeParameter('operation', 0) as string;
 
-		// Build Executor
-		// const httpClient = await HttpClient.create(this);
-		// const state = new State(this, nodeDescr, resource, operation);
-		// const opResolver = new ResOpResolver(operationMethods, resource, operation, fallbackOperation);
-		// const executor = new ResOpExecutor(state, opResolver, httpClient);
-		const returnParamsExec = new ReturnParamsExecutor(new StateBase(this));
+		for (let itemIndex = 0; itemIndex < length; itemIndex++) {
+			try {
+				let result: any;
+				switch (resource) {
+					case "post":
+						switch (operation) {
+							case "create":
+								result = {resource, operation};
+								break;
+							case "update":
+								result = {resource, operation};
+								break;
+							case "get":
+								result = {resource, operation};
+								break;
+							case "getAll":
+								result = {resource, operation};
+								break;
+							case "delete":
+								result = {resource, operation};
+								break;
+						}
+					break;
 
-		const nodeExec = getNodeExecFn(returnParamsExec.execute);
-		return nodeExec.call(this);
+					case "comment":
+						switch (operation) {
+							case "create":
+								result = {resource, operation};
+								break;
+							case "update":
+								result = {resource, operation};
+								break;
+							case "get":
+								result = {resource, operation};
+								break;
+							case "getAll":
+								result = {resource, operation};
+								break;
+							case "delete":
+								result = {resource, operation};
+								break;
+						}
+					break;
+				}
+
+				if (result.constructor === Array) {
+					returnData.push.apply(returnData, result);
+				} else {
+					returnData.push(result);
+				}
+			} catch (error) {
+				if (this.continueOnFail()) {
+					returnData.push({ error: error.message });
+					continue;
+				}
+				throw error;
+			}
+		}
+		return [this.helpers.returnJsonArray(returnData)];
 	}
 }
 
```
