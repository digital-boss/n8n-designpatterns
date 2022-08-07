# step4-3-3...step4-3-4 [compare](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step4-3-3...step4-3-4)

- [nodes/FakeCrm/FakeCrm.node.ts](#nodes/FakeCrm/FakeCrm.node.ts)
- [nodes/FakeCrm/backend/operations.ts](#nodes/FakeCrm/backend/operations.ts)

## nodes/FakeCrm/FakeCrm.node.ts<a name="nodes/FakeCrm/FakeCrm.node.ts"></a>

- [nodes/FakeCrm/FakeCrm.node.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/2f5935fc2cf3c0f16aa6c036148013a89a9bbcbc/nodes%2FFakeCrm%2FFakeCrm.node.ts) modified [3,5,8] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/eef8ba9ebcbd4de67d4d337c2399efced3a45916/nodes%2FFakeCrm%2FFakeCrm.node.ts)

```diff
@@ -21,7 +21,7 @@ import { resourcesConst } from './descriptions/generated/resourceOperations';
 import { ResOpExecutor, ResOpResolver } from '@digital-boss/n8n-designpatterns/dist/usecases/res-op';
 import { ReturnParamsExecutor } from '@digital-boss/n8n-designpatterns/dist/usecases';
 import { getNodeExecFn, StateBase } from '@digital-boss/n8n-designpatterns/dist';
-import { operationMethods } from './backend/operations';
+import { fallbackOperation, operationMethods } from './backend/operations';
 import { HttpClientBasic } from './backend/HttpClientBasic';
 import { IFakeCrmApiCredentials } from 'credentials/FakeCrmApi.credentials';
 import { State } from './backend/State';
@@ -86,10 +86,8 @@ const getItemExecutor = async (execFns: IExecuteFunctions) => {
 		throw new NodeOperationError(execFns.getNode(), `Resource not found: ${resourceName}`);
 	}
 
-	const operation = resource[operationName];
-	if (!operation) {
-		throw new NodeOperationError(execFns.getNode(), `Operation not found: ${operationName}`);
-	}
+	const opCandidate = resource[operationName];
+	const operation = opCandidate !== undefined ? opCandidate : fallbackOperation;
 
 	return async (itemIndex: number): Promise<any> => {
 		state.updateIndex(itemIndex);
```

## nodes/FakeCrm/backend/operations.ts<a name="nodes/FakeCrm/backend/operations.ts"></a>

- [nodes/FakeCrm/backend/operations.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/2f5935fc2cf3c0f16aa6c036148013a89a9bbcbc/nodes%2FFakeCrm%2Fbackend%2Foperations.ts) modified [2,28,30] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/eef8ba9ebcbd4de67d4d337c2399efced3a45916/nodes%2FFakeCrm%2Fbackend%2Foperations.ts)

```diff
@@ -1,7 +1,3 @@
-import { OptionsWithUri } from 'request';
-import {
-	IExecuteFunctions,
-} from 'n8n-core';
 import { IDataObject } from "n8n-workflow";
 import { IHttpClient } from './interfaces';
 import { State } from './State';
@@ -29,18 +25,6 @@ const post: OpContainer = {
 				tags: getTags(state.getParam('tags'))
 			}, state.getParam('additionalFields')),
 		})).then(res => res || {});
-	},
-
-	get: (client, state) => {
-		return client.request(state.buildRequest());
-	},
-
-	getAll: (client, state) => {
-		return client.request(state.buildRequest());
-	},
-
-	delete: (client, state) => {
-		return client.request(state.buildRequest());
 	}
 }
 
@@ -57,20 +41,10 @@ const comment: OpContainer = {
 			body: state.getParam('additionalFields'),
 		})).then(res => res || {});
 	},
-
-	get: (client, state) => {
-		return client.request(state.buildRequest());
-	},
-
-	getAll:(client, state) => {
-		return client.request(state.buildRequest());
-	},
-
-	delete: (client, state) => {
-		return client.request(state.buildRequest());
-	}
 }
 
+export const fallbackOperation: OpFn = (client, state) => client.request(state.buildRequest());
+
 export const operationMethods = {
 	post,
 	comment
```
