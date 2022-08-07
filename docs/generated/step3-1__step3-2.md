# step3-1...step3-2 [compare](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step3-1...step3-2)

- [nodes/FakeCrm/FakeCrm.node.ts](#nodes/FakeCrm/FakeCrm.node.ts)
- [nodes/FakeCrm/GenericFunctions.ts](#nodes/FakeCrm/GenericFunctions.ts)
- [workflows/test.json](#workflows/test.json)

## nodes/FakeCrm/FakeCrm.node.ts<a name="nodes/FakeCrm/FakeCrm.node.ts"></a>

- [nodes/FakeCrm/FakeCrm.node.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/13f50acf40a51076ea7960a3b44228a30b52d6e0/nodes%2FFakeCrm%2FFakeCrm.node.ts) modified [67,11,78] [prev](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/23518e90acee841708f2ea035012defd527f7268/nodes%2FFakeCrm%2FFakeCrm.node.ts)

```diff
@@ -20,7 +20,11 @@ import { resourcesConst } from './descriptions/generated/resourceOperations';
 import { ResOpExecutor, ResOpResolver } from '@digital-boss/n8n-designpatterns/dist/usecases/res-op';
 import { ReturnParamsExecutor } from '@digital-boss/n8n-designpatterns/dist/usecases';
 import { getNodeExecFn, StateBase } from '@digital-boss/n8n-designpatterns/dist';
+import { fakeCrmRequest } from './GenericFunctions';
 
+const getTags = (param: IDataObject): string[] => {
+	return (param.tagProps as string[] || []).map((i: any) => i.tag)
+}
 
 export class FakeCrm implements INodeType {
 	description: INodeTypeDescription = {
@@ -57,6 +61,13 @@ export class FakeCrm implements INodeType {
 	};
 
 	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
+
+		// Uncomment following lines to output app parameters with values as node execution result. Can be helpfull in debugging.
+		// const params0 = this.getNode().parameters;
+		// const paramsWithValues0 = Object.keys(params0).map(name => [name, this.getNodeParameter(name, 0)]);
+		// const res0 = Object.fromEntries(paramsWithValues0);
+		// return [this.helpers.returnJsonArray(res0)];
+
 		const items = this.getInputData();
 		const length = items.length;
 		const returnData: IDataObject[] = [];
@@ -65,49 +76,93 @@ export class FakeCrm implements INodeType {
 
 		for (let itemIndex = 0; itemIndex < length; itemIndex++) {
 			try {
-				let result: any;
+				let method: string = 'GET';
+				let path: string = '/';
+				let body: IDataObject = {};
+
+				let id: string = '';
+				let postId: string = '';
+				let tags: string[] = [];
+
 				switch (resource) {
 					case "post":
 						switch (operation) {
 							case "create":
-								result = {resource, operation};
+								method = 'POST';
+								path = '/post';
+								const tagsColl1 = this.getNodeParameter('tags', itemIndex) as IDataObject;
+								tags = getTags(tagsColl1);
+								body = Object.assign({},
+									this.getNodeParameter('additionalFields', itemIndex) as IDataObject,
+									{tags}
+								);
 								break;
 							case "update":
-								result = {resource, operation};
+								method = 'PUT';
+								id = this.getNodeParameter('id', itemIndex) as string;
+								path = `/post/${id}`;
+								const tagsColl2 = this.getNodeParameter('tags', itemIndex) as IDataObject;
+								tags = getTags(tagsColl2);
+								body = Object.assign({},
+									this.getNodeParameter('additionalFields', itemIndex) as IDataObject,
+									{tags}
+								);
 								break;
 							case "get":
-								result = {resource, operation};
+								method = 'GET';
+								id = this.getNodeParameter('id', itemIndex) as string;
+								path = `/post/${id}`;
 								break;
 							case "getAll":
-								result = {resource, operation};
+								method = 'GET';
+								path = '/post';
 								break;
 							case "delete":
-								result = {resource, operation};
+								method = 'DELETE';
+								id = this.getNodeParameter('id', itemIndex) as string;
+								path = `/post/${id}`;
 								break;
 						}
 					break;
 
 					case "comment":
 						switch (operation) {
 							case "create":
-								result = {resource, operation};
+								method = 'POST';
+								postId = this.getNodeParameter('postId', itemIndex) as string;
+								path = `/post/${postId}/comment`;
+								body = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
 								break;
 							case "update":
-								result = {resource, operation};
+								method = 'PUT';
+								postId = this.getNodeParameter('postId', itemIndex) as string;
+								id = this.getNodeParameter('id', itemIndex) as string;
+								path = `/post/${postId}/comment/${id}`;
+								body = this.getNodeParameter('additionalFields', itemIndex) as IDataObject;
 								break;
 							case "get":
-								result = {resource, operation};
+								method = 'GET';
+								postId = this.getNodeParameter('postId', itemIndex) as string;
+								id = this.getNodeParameter('id', itemIndex) as string;
+								path = `/post/${postId}/comment/${id}`;
 								break;
 							case "getAll":
-								result = {resource, operation};
+								method = 'GET';
+								postId = this.getNodeParameter('postId', itemIndex) as string;
+								path = `/post/${postId}/comment`;
 								break;
 							case "delete":
-								result = {resource, operation};
+								method = 'DELETE';
+								postId = this.getNodeParameter('postId', itemIndex) as string;
+								id = this.getNodeParameter('id', itemIndex) as string;
+								path = `/post/${postId}/comment/${id}`;
 								break;
 						}
 					break;
 				}
 
+				const result = await fakeCrmRequest.call(this, method, path, body) || {};
+
 				if (result.constructor === Array) {
 					returnData.push.apply(returnData, result);
 				} else {
@@ -121,6 +176,7 @@ export class FakeCrm implements INodeType {
 				throw error;
 			}
 		}
+
 		return [this.helpers.returnJsonArray(returnData)];
 	}
 }
```

## nodes/FakeCrm/GenericFunctions.ts<a name="nodes/FakeCrm/GenericFunctions.ts"></a>

- [nodes/FakeCrm/GenericFunctions.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/13f50acf40a51076ea7960a3b44228a30b52d6e0/nodes%2FFakeCrm%2FGenericFunctions.ts) added [45,0,45]

```diff
@@ -0,0 +1,45 @@
+import { OptionsWithUri } from "request";
+
+import {
+	IExecuteFunctions,
+	IExecuteSingleFunctions,
+	IHookFunctions,
+	ILoadOptionsFunctions,
+} from "n8n-core";
+
+import { IDataObject, NodeApiError, NodeOperationError } from "n8n-workflow";
+import { IFakeCrmApiCredentials } from "credentials/FakeCrmApi.credentials";
+
+export async function fakeCrmRequest(
+	this:
+		| IHookFunctions
+		| IExecuteFunctions
+		| IExecuteSingleFunctions
+		| ILoadOptionsFunctions,
+	method: string,
+	path: string,
+	body: object = {},
+): Promise<any> {
+
+	const creds = (await this.getCredentials("fakeCrmApi")) as unknown as IFakeCrmApiCredentials;
+
+	if (creds === undefined) {
+		throw new NodeOperationError(
+			this.getNode(),
+			"No credentials got returned!"
+		);
+	}
+
+	const options: OptionsWithUri = {
+		method,
+		body,
+		uri: creds.host + path,
+		json: true,
+	};
+
+	try {
+		return this.helpers.request!(options);
+	} catch (error) {
+		throw new NodeApiError(this.getNode(), error);
+	}
+}
```

## workflows/test.json<a name="workflows/test.json"></a>

- [workflows/test.json](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/13f50acf40a51076ea7960a3b44228a30b52d6e0/workflows%2Ftest.json) added [321,0,321]

```diff
@@ -0,0 +1,321 @@
+{
+  "nodes": [
+    {
+      "parameters": {},
+      "name": "Start",
+      "type": "n8n-nodes-base.start",
+      "typeVersion": 1,
+      "position": [
+        280,
+        220
+      ]
+    },
+    {
+      "parameters": {
+        "operation": "create",
+        "tags": {
+          "tagProps": [
+            {
+              "tag": "aaa"
+            },
+            {
+              "tag": "bbb"
+            }
+          ]
+        },
+        "additionalFields": {
+          "title": "Hello there !",
+          "createTime": "2022-08-03T18:42:00.791Z",
+          "author": "Me",
+          "content": "heeey la la la"
+        }
+      },
+      "name": "FakeCrm",
+      "type": "@digital-boss/n8n-nodes-designpatterns-tutorial.fakeCrm",
+      "typeVersion": 1,
+      "position": [
+        520,
+        220
+      ],
+      "credentials": {
+        "fakeCrmApi": {
+          "id": "18",
+          "name": "FakeCrm account"
+        }
+      }
+    },
+    {
+      "parameters": {
+        "resource": "comment",
+        "operation": "create",
+        "postId": 11,
+        "additionalFields": {
+          "createTime": "2022-08-03T20:22:05.444Z",
+          "author": "Peter",
+          "content": "tra ta ta ta"
+        }
+      },
+      "name": "FakeCrm1",
+      "type": "@digital-boss/n8n-nodes-designpatterns-tutorial.fakeCrm",
+      "typeVersion": 1,
+      "position": [
+        1120,
+        220
+      ],
+      "credentials": {
+        "fakeCrmApi": {
+          "id": "18",
+          "name": "FakeCrm account"
+        }
+      }
+    },
+    {
+      "parameters": {
+        "operation": "update",
+        "id": 11,
+        "tags": {
+          "tagProps": [
+            {
+              "tag": "EEEE"
+            }
+          ]
+        },
+        "additionalFields": {
+          "title": "qwe",
+          "author": "asd",
+          "content": "zxc"
+        }
+      },
+      "name": "FakeCrm2",
+      "type": "@digital-boss/n8n-nodes-designpatterns-tutorial.fakeCrm",
+      "typeVersion": 1,
+      "position": [
+        780,
+        220
+      ],
+      "credentials": {
+        "fakeCrmApi": {
+          "id": "18",
+          "name": "FakeCrm account"
+        }
+      }
+    },
+    {
+      "parameters": {
+        "operation": "get",
+        "id": 11
+      },
+      "name": "FakeCrm3",
+      "type": "@digital-boss/n8n-nodes-designpatterns-tutorial.fakeCrm",
+      "typeVersion": 1,
+      "position": [
+        780,
+        540
+      ],
+      "credentials": {
+        "fakeCrmApi": {
+          "id": "18",
+          "name": "FakeCrm account"
+        }
+      }
+    },
+    {
+      "parameters": {},
+      "name": "FakeCrm4",
+      "type": "@digital-boss/n8n-nodes-designpatterns-tutorial.fakeCrm",
+      "typeVersion": 1,
+      "position": [
+        780,
+        380
+      ],
+      "credentials": {
+        "fakeCrmApi": {
+          "id": "18",
+          "name": "FakeCrm account"
+        }
+      }
+    },
+    {
+      "parameters": {
+        "operation": "delete",
+        "id": 11
+      },
+      "name": "FakeCrm5",
+      "type": "@digital-boss/n8n-nodes-designpatterns-tutorial.fakeCrm",
+      "typeVersion": 1,
+      "position": [
+        1460,
+        860
+      ],
+      "credentials": {
+        "fakeCrmApi": {
+          "id": "18",
+          "name": "FakeCrm account"
+        }
+      }
+    },
+    {
+      "parameters": {
+        "resource": "comment",
+        "operation": "update",
+        "postId": 11,
+        "id": 1,
+        "additionalFields": {
+          "createTime": "2022-08-03T21:00:00.000Z",
+          "author": "tttttttt",
+          "content": "owiefj owief jowiefj owiejoijoiwjfe"
+        }
+      },
+      "name": "FakeCrm6",
+      "type": "@digital-boss/n8n-nodes-designpatterns-tutorial.fakeCrm",
+      "typeVersion": 1,
+      "position": [
+        1120,
+        380
+      ],
+      "credentials": {
+        "fakeCrmApi": {
+          "id": "18",
+          "name": "FakeCrm account"
+        }
+      }
+    },
+    {
+      "parameters": {
+        "resource": "comment",
+        "operation": "get",
+        "postId": 11,
+        "id": 1
+      },
+      "name": "FakeCrm7",
+      "type": "@digital-boss/n8n-nodes-designpatterns-tutorial.fakeCrm",
+      "typeVersion": 1,
+      "position": [
+        1120,
+        700
+      ],
+      "credentials": {
+        "fakeCrmApi": {
+          "id": "18",
+          "name": "FakeCrm account"
+        }
+      }
+    },
+    {
+      "parameters": {
+        "resource": "comment",
+        "postId": 11
+      },
+      "name": "FakeCrm8",
+      "type": "@digital-boss/n8n-nodes-designpatterns-tutorial.fakeCrm",
+      "typeVersion": 1,
+      "position": [
+        1120,
+        540
+      ],
+      "credentials": {
+        "fakeCrmApi": {
+          "id": "18",
+          "name": "FakeCrm account"
+        }
+      }
+    },
+    {
+      "parameters": {
+        "resource": "comment",
+        "operation": "delete",
+        "postId": 11,
+        "id": 1
+      },
+      "name": "FakeCrm9",
+      "type": "@digital-boss/n8n-nodes-designpatterns-tutorial.fakeCrm",
+      "typeVersion": 1,
+      "position": [
+        1460,
+        700
+      ],
+      "credentials": {
+        "fakeCrmApi": {
+          "id": "18",
+          "name": "FakeCrm account"
+        }
+      }
+    }
+  ],
+  "connections": {
+    "Start": {
+      "main": [
+        [
+          {
+            "node": "FakeCrm",
+            "type": "main",
+            "index": 0
+          }
+        ]
+      ]
+    },
+    "FakeCrm": {
+      "main": [
+        [
+          {
+            "node": "FakeCrm2",
+            "type": "main",
+            "index": 0
+          },
+          {
+            "node": "FakeCrm3",
+            "type": "main",
+            "index": 0
+          },
+          {
+            "node": "FakeCrm4",
+            "type": "main",
+            "index": 0
+          }
+        ]
+      ]
+    },
+    "FakeCrm3": {
+      "main": [
+        [
+          {
+            "node": "FakeCrm1",
+            "type": "main",
+            "index": 0
+          },
+          {
+            "node": "FakeCrm6",
+            "type": "main",
+            "index": 0
+          },
+          {
+            "node": "FakeCrm8",
+            "type": "main",
+            "index": 0
+          },
+          {
+            "node": "FakeCrm7",
+            "type": "main",
+            "index": 0
+          }
+        ]
+      ]
+    },
+    "FakeCrm7": {
+      "main": [
+        [
+          {
+            "node": "FakeCrm9",
+            "type": "main",
+            "index": 0
+          },
+          {
+            "node": "FakeCrm5",
+            "type": "main",
+            "index": 0
+          }
+        ]
+      ]
+    }
+  }
+}
```
