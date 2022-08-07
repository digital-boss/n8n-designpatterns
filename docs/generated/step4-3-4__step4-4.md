# step4-3-4...step4-4 [compare](https://api.github.com/repos/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step4-3-4...step4-4)

- [nodes/FakeCrm/FakeCrm.node.ts](#nodes/FakeCrm/FakeCrm.node.ts)
- [nodes/FakeCrm/backend/ResOpResolver.ts](#nodes/FakeCrm/backend/ResOpResolver.ts)
- [nodes/FakeCrm/backend/interfaces.ts](#nodes/FakeCrm/backend/interfaces.ts)

## nodes/FakeCrm/FakeCrm.node.ts<a name="nodes/FakeCrm/FakeCrm.node.ts"></a>

- [nodes/FakeCrm/FakeCrm.node.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/68211b19ef29231bb87521f10da6326420bd5199/nodes%2FFakeCrm%2FFakeCrm.node.ts) modified [2,7,9] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/2f5935fc2cf3c0f16aa6c036148013a89a9bbcbc/nodes%2FFakeCrm%2FFakeCrm.node.ts)

```diff
@@ -80,14 +80,9 @@ const getItemExecutor = async (execFns: IExecuteFunctions) => {
 	const creds = await (execFns.getCredentials('fakeCrmApi')) as unknown as IFakeCrmApiCredentials
 	const httpClient = new HttpClientBasic(execFns.helpers.request, creds);
 	const state = new State(execFns, nodeDescr, resourceName, operationName);
+	const operationResolver = new ResOpResolver(operationMethods, resourceName, operationName, fallbackOperation);
 
-	const resource = operationMethods[resourceName];
-	if (!resource) {
-		throw new NodeOperationError(execFns.getNode(), `Resource not found: ${resourceName}`);
-	}
-
-	const opCandidate = resource[operationName];
-	const operation = opCandidate !== undefined ? opCandidate : fallbackOperation;
+	const operation = operationResolver.getOperationMethod()
 
 	return async (itemIndex: number): Promise<any> => {
 		state.updateIndex(itemIndex);
```

## nodes/FakeCrm/backend/ResOpResolver.ts<a name="nodes/FakeCrm/backend/ResOpResolver.ts"></a>

- [nodes/FakeCrm/backend/ResOpResolver.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/68211b19ef29231bb87521f10da6326420bd5199/nodes%2FFakeCrm%2Fbackend%2FResOpResolver.ts) added [32,0,32]

```diff
@@ -0,0 +1,32 @@
+import { IOperationResolver } from "./interfaces";
+
+export class ResOpResolver<TOpFn, TResName extends string=string> implements IOperationResolver<TOpFn> {
+
+	constructor (
+    private operations: Record<TResName, Record<string, TOpFn>>,
+		private resourceName: TResName,
+		private operationName: string,
+    private fallbackOp?: TOpFn,
+	) {}
+
+	getOperationMethod(): TOpFn {
+
+		const res = this.operations[this.resourceName];
+
+		if (!res) {
+			throw new Error(`There is no resource: '${this.resourceName}'`);
+		}
+
+		const op: TOpFn = (res as any)[this.operationName];
+		if (!op) {
+      if (this.fallbackOp) {
+        return this.fallbackOp;
+      } else {
+        throw new Error(`There is no operation: '${this.operationName}'`);
+      }
+		} else {
+			return op;
+		}
+	}
+
+}
```

## nodes/FakeCrm/backend/interfaces.ts<a name="nodes/FakeCrm/backend/interfaces.ts"></a>

- [nodes/FakeCrm/backend/interfaces.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/68211b19ef29231bb87521f10da6326420bd5199/nodes%2FFakeCrm%2Fbackend%2Finterfaces.ts) modified [4,0,4] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/1847b527dc813de36fe3b7dc595d94cefc7acde8/nodes%2FFakeCrm%2Fbackend%2Finterfaces.ts)

```diff
@@ -16,3 +16,7 @@ export interface IState {
 	itemIndex: number;
 	updateIndex: (itemIndex: number) => void;
 }
+
+export interface IOperationResolver<TOpFn> {
+	getOperationMethod: () => TOpFn;
+}
```
