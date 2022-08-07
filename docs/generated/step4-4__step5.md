# step4-4...step5 [compare](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step4-4...step5)

- [nodes/FakeCrm/FakeCrm.node.ts](#nodes/FakeCrm/FakeCrm.node.ts)
- [nodes/FakeCrm/backend/HttpClientBasic.ts](#nodes/FakeCrm/backend/HttpClientBasic.ts)
- [nodes/FakeCrm/backend/ResOpResolver.ts](#nodes/FakeCrm/backend/ResOpResolver.ts)
- [nodes/FakeCrm/backend/State.ts](#nodes/FakeCrm/backend/State.ts)
- [nodes/FakeCrm/backend/getNodeExecFn.ts](#nodes/FakeCrm/backend/getNodeExecFn.ts)
- [nodes/FakeCrm/backend/interfaces.ts](#nodes/FakeCrm/backend/interfaces.ts)
- [nodes/FakeCrm/backend/operations.ts](#nodes/FakeCrm/backend/operations.ts)

## nodes/FakeCrm/FakeCrm.node.ts<a name="nodes/FakeCrm/FakeCrm.node.ts"></a>

- [nodes/FakeCrm/FakeCrm.node.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/4422e472d1f58d766d84f9aecfc08fdafcf50cd4/nodes%2FFakeCrm%2FFakeCrm.node.ts) modified [11,19,30] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/68211b19ef29231bb87521f10da6326420bd5199/nodes%2FFakeCrm%2FFakeCrm.node.ts)

```diff
@@ -65,27 +65,19 @@ export class FakeCrm implements INodeType {
 	};
 
 	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
-		const execItemFn = await getItemExecutor(this)
-		const nodeExec = getNodeExecFn(execItemFn);
+		const resource = this.getNodeParameter('resource', 0) as typeof resourcesConst[number];
+		const operation = this.getNodeParameter('operation', 0) as string;
+		const creds = await this.getCredentials('fakeCrmApi') as unknown as IFakeCrmApiCredentials;
+
+		// Build Executor
+		const httpClient = new HttpClientBasic(this.helpers.request, creds);
+		const state =  new State(this, nodeDescr, resource, operation);
+		const opResolver = new ResOpResolver(operationMethods, resource, operation, fallbackOperation);
+		const executor = new ResOpExecutor(state, opResolver, httpClient);
+
+		const nodeExec = getNodeExecFn(executor.execute);
 		return nodeExec.call(this);
 	}
 
 }
 
-const getItemExecutor = async (execFns: IExecuteFunctions) => {
-
-	const resourceName = execFns.getNodeParameter('resource', 0) as typeof resourcesConst[number];
-	const operationName = execFns.getNodeParameter('operation', 0) as string;
-
-	const creds = await (execFns.getCredentials('fakeCrmApi')) as unknown as IFakeCrmApiCredentials
-	const httpClient = new HttpClientBasic(execFns.helpers.request, creds);
-	const state = new State(execFns, nodeDescr, resourceName, operationName);
-	const operationResolver = new ResOpResolver(operationMethods, resourceName, operationName, fallbackOperation);
-
-	const operation = operationResolver.getOperationMethod()
-
-	return async (itemIndex: number): Promise<any> => {
-		state.updateIndex(itemIndex);
-		return operation(httpClient, state);
-	}
-}
```

## nodes/FakeCrm/backend/HttpClientBasic.ts<a name="nodes/FakeCrm/backend/HttpClientBasic.ts"></a>

- [nodes/FakeCrm/backend/HttpClientBasic.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/4422e472d1f58d766d84f9aecfc08fdafcf50cd4/nodes%2FFakeCrm%2Fbackend%2FHttpClientBasic.ts) modified [1,1,2] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/2eca392a2e62b3417933f9b797ab493e8dcf4074/nodes%2FFakeCrm%2Fbackend%2FHttpClientBasic.ts)

```diff
@@ -1,6 +1,6 @@
+import { IHttpClient } from '@digital-boss/n8n-designpatterns/dist/interfaces';
 import { IDataObject } from 'n8n-workflow';
 import { OptionsWithUri } from 'request';
-import { IHttpClient } from './interfaces';
 
 export interface IBasicAuth {
 	url: string;
```

## nodes/FakeCrm/backend/ResOpResolver.ts<a name="nodes/FakeCrm/backend/ResOpResolver.ts"></a>

- [nodes/FakeCrm/backend/ResOpResolver.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/68211b19ef29231bb87521f10da6326420bd5199/nodes%2FFakeCrm%2Fbackend%2FResOpResolver.ts) removed [0,32,32] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/68211b19ef29231bb87521f10da6326420bd5199/nodes%2FFakeCrm%2Fbackend%2FResOpResolver.ts)

```diff
@@ -1,32 +0,0 @@
-import { IOperationResolver } from "./interfaces";
-
-export class ResOpResolver<TOpFn, TResName extends string=string> implements IOperationResolver<TOpFn> {
-
-	constructor (
-    private operations: Record<TResName, Record<string, TOpFn>>,
-		private resourceName: TResName,
-		private operationName: string,
-    private fallbackOp?: TOpFn,
-	) {}
-
-	getOperationMethod(): TOpFn {
-
-		const res = this.operations[this.resourceName];
-
-		if (!res) {
-			throw new Error(`There is no resource: '${this.resourceName}'`);
-		}
-
-		const op: TOpFn = (res as any)[this.operationName];
-		if (!op) {
-      if (this.fallbackOp) {
-        return this.fallbackOp;
-      } else {
-        throw new Error(`There is no operation: '${this.operationName}'`);
-      }
-		} else {
-			return op;
-		}
-	}
-
-}
```

## nodes/FakeCrm/backend/State.ts<a name="nodes/FakeCrm/backend/State.ts"></a>

- [nodes/FakeCrm/backend/State.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/4422e472d1f58d766d84f9aecfc08fdafcf50cd4/nodes%2FFakeCrm%2Fbackend%2FState.ts) modified [2,69,71] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/eef8ba9ebcbd4de67d4d337c2399efced3a45916/nodes%2FFakeCrm%2Fbackend%2FState.ts)

```diff
@@ -2,80 +2,13 @@ import {
 	CoreOptions,
 	OptionsWithUri,
 } from 'request';
-import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
-import { IState } from './interfaces';
 import { INodeDescr, IOperation, IResource } from '../descriptions/types';
-
-/**
- * Base class for state
- */
-class StateBase implements IState {
-	itemIndex = 0;
-	execFns: IExecuteFunctions;
-
-	constructor (
-		execFns: IExecuteFunctions,
-	) {
-		this.execFns = execFns;
-	}
-
-	updateIndex (itemIndex: number) {
-		this.itemIndex = itemIndex;
-	}
-
-	getParam (name: string): any {
-		return this.execFns.getNodeParameter(name, this.itemIndex);
-	}
-
-	applyPathParams (path: string): string {
-		const rx = new RegExp('{[a-zA-Z_][a-zA-Z0-9]*}', 'g');
-		const matches = path.match(rx);
-		if (matches && matches.length > 0) {
-			matches.forEach((match, i) => {
-				const value = this.getParam(match.slice(1, -1)) as string;
-				if (value !== undefined) {
-					path = path.replace(match, value);
-				}
-			});
-		}
-		return path;
-	}
-}
-
-/**
- * State for Resource-Operation Node
- */
-abstract class ResOpState extends StateBase {
-
-	resource: IResource;
-	operation: IOperation;
-
-	// from c-tor:
-	nodeDescr: INodeDescr;
-	resourceName: string;
-	operationName: string;
-
-	constructor (
-		execFns: IExecuteFunctions,
-		nodeDescr: INodeDescr,
-		resourceName: string,
-		opearationName: string,
-	) {
-		super(execFns);
-
-		this.nodeDescr = nodeDescr;
-		this.resourceName = resourceName;
-		this.operationName = opearationName;
-
-		this.resource = this.nodeDescr.resources[this.resourceName]
-		this.operation = this.resource.operations[this.operationName];
-	}
-}
+import { ResOpState } from '@digital-boss/n8n-designpatterns/dist/usecases/res-op';
 
 /**
  * Access Node state, getting parameters.
  */
- export class State extends ResOpState {
+ export class State extends ResOpState<INodeDescr, IResource, IOperation> {
 
 	buildRequest (coreOpts: CoreOptions = {}): OptionsWithUri {
 		const pathWithValues = this.applyPathParams(this.operation.path);
```

## nodes/FakeCrm/backend/getNodeExecFn.ts<a name="nodes/FakeCrm/backend/getNodeExecFn.ts"></a>

- [nodes/FakeCrm/backend/getNodeExecFn.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/68211b19ef29231bb87521f10da6326420bd5199/nodes%2FFakeCrm%2Fbackend%2FgetNodeExecFn.ts) removed [0,25,25] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/61b65ab15e4bfaeb3013e3375011844572ec2d59/nodes%2FFakeCrm%2Fbackend%2FgetNodeExecFn.ts)

```diff
@@ -1,25 +0,0 @@
-import { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
-
-export const getNodeExecFn = (execItem: (itemIndex: number) => Promise<any>) => async function (this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
-	const items = this.getInputData();
-	const length = items.length;
-	const returnData: IDataObject[] = [];
-
-	for (let itemIndex = 0; itemIndex < length; itemIndex++) {
-		try {
-			const result = await execItem(itemIndex);
-			if (result.constructor === Array) {
-				returnData.push.apply(returnData, result);
-			} else {
-				returnData.push(result);
-			}
-		} catch (error) {
-			if (this.continueOnFail()) {
-				returnData.push({ error: error.message });
-				continue;
-			}
-			throw error;
-		}
-	}
-	return [this.helpers.returnJsonArray(returnData)];
-};
```

## nodes/FakeCrm/backend/interfaces.ts<a name="nodes/FakeCrm/backend/interfaces.ts"></a>

- [nodes/FakeCrm/backend/interfaces.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/68211b19ef29231bb87521f10da6326420bd5199/nodes%2FFakeCrm%2Fbackend%2Finterfaces.ts) removed [0,22,22] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/68211b19ef29231bb87521f10da6326420bd5199/nodes%2FFakeCrm%2Fbackend%2Finterfaces.ts)

```diff
@@ -1,22 +0,0 @@
-import { OptionsWithUri } from 'request';
-
-/**
- * Makes HTTP requests
- */
-export interface IHttpClient {
-	request: (opts: OptionsWithUri) => Promise<any>;
-}
-
-/**
- * Interface to implement for classes dependant on execution item index.
- * For example, if class reads parameter: execFn.getNodeParameter('resource', itemIndex),
- * then it depends on itemIndex
- */
-export interface IState {
-	itemIndex: number;
-	updateIndex: (itemIndex: number) => void;
-}
-
-export interface IOperationResolver<TOpFn> {
-	getOperationMethod: () => TOpFn;
-}
```

## nodes/FakeCrm/backend/operations.ts<a name="nodes/FakeCrm/backend/operations.ts"></a>

- [nodes/FakeCrm/backend/operations.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/4422e472d1f58d766d84f9aecfc08fdafcf50cd4/nodes%2FFakeCrm%2Fbackend%2Foperations.ts) modified [3,2,5] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/2f5935fc2cf3c0f16aa6c036148013a89a9bbcbc/nodes%2FFakeCrm%2Fbackend%2Foperations.ts)

```diff
@@ -1,8 +1,9 @@
+import { IHttpClient } from "@digital-boss/n8n-designpatterns/dist";
+import { OperationFn } from "@digital-boss/n8n-designpatterns/dist/usecases/res-op";
 import { IDataObject } from "n8n-workflow";
-import { IHttpClient } from './interfaces';
 import { State } from './State';
 
-type OpFn = (client: IHttpClient, state: State) => Promise<any>;
+type OpFn = OperationFn<IHttpClient, State>
 type OpContainer = Record<string, OpFn>
 
 const getTags = (param: IDataObject): string[] => {
```
