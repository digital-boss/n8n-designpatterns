# step1...step2 [compare](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step1...step2)

- [credentials/FakeCrmApi.credentials.ts](#credentials/FakeCrmApi.credentials.ts)
- [nodes/FakeCrm/FakeCrm.node.ts](#nodes/FakeCrm/FakeCrm.node.ts)
- [nodes/FakeCrm/descriptions/FakeCrm.description.yaml](#nodes/FakeCrm/descriptions/FakeCrm.description.yaml)
- [nodes/FakeCrm/descriptions/gen.ts](#nodes/FakeCrm/descriptions/gen.ts)
- [nodes/FakeCrm/descriptions/types.ts](#nodes/FakeCrm/descriptions/types.ts)

## credentials/FakeCrmApi.credentials.ts<a name="credentials/FakeCrmApi.credentials.ts"></a>

- [credentials/FakeCrmApi.credentials.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/06e7eb5cb2927253d74abe775d55b527cfb3593a/credentials%2FFakeCrmApi.credentials.ts) modified [4,24,28]

```diff
@@ -4,9 +4,7 @@ import {
 } from 'n8n-workflow';
 
 export interface IFakeCrmApiCredentials {
-	email: string;
-	password: string;
-	token: string;
+	host: string;
 }
 
 export class FakeCrmApi implements ICredentialType {
@@ -15,28 +13,10 @@ export class FakeCrmApi implements ICredentialType {
 	documentationUrl = 'fakeCrm';
 	properties: INodeProperties[] = [
 		{
-			displayName: 'Email',
-			name: 'email',
+			displayName: 'Host',
+			name: 'host',
 			type: 'string',
-			default: '',
-		},
-		{
-			displayName: 'Password',
-			name: 'password',
-			type: 'string',
-			default: '',
-			typeOptions: {
-				password: true,
-			},
-		},
-		{
-			displayName: 'Access Token',
-			name: 'token',
-			type: 'string',
-			default: '',
-			typeOptions: {
-				password: true,
-			},
+			default: 'http://localhost:3000',
 		},
 	];
 }
```

## nodes/FakeCrm/FakeCrm.node.ts<a name="nodes/FakeCrm/FakeCrm.node.ts"></a>

- [nodes/FakeCrm/FakeCrm.node.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/06e7eb5cb2927253d74abe775d55b527cfb3593a/nodes%2FFakeCrm%2FFakeCrm.node.ts) modified [4,4,8]

```diff
@@ -12,6 +12,8 @@ import {
 import { version } from '../version';
 import { fakeCrmApiTest } from './FakeCrmApiTest';
 import { resources } from './descriptions/generated/resources';
+import { postFields } from "./descriptions/generated/postFields";
+import { commentFields } from "./descriptions/generated/commentFields";
 import { nodeDescr } from './descriptions/generated/nodeDescr';
 import { resourcesConst } from './descriptions/generated/resourceOperations';
 import { ResOpExecutor, ResOpResolver } from '@digital-boss/n8n-designpatterns/dist/usecases/res-op';
@@ -23,7 +25,6 @@ export class FakeCrm implements INodeType {
 	description: INodeTypeDescription = {
 		displayName: 'FakeCrm',
 		name: 'fakeCrm',
-		icon: 'file:fakeCrm',
 		group: ['transform'],
 		version: 1,
 		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
@@ -43,9 +44,8 @@ export class FakeCrm implements INodeType {
 		],
 		properties: [
 			resources,
-			//...<resource1>Fields,
-			//...<resource2>Fields,
-			//...
+			...postFields,
+			...commentFields,
 		],
 	};
 
```

## nodes/FakeCrm/descriptions/FakeCrm.description.yaml<a name="nodes/FakeCrm/descriptions/FakeCrm.description.yaml"></a>

- [nodes/FakeCrm/descriptions/FakeCrm.description.yaml](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/06e7eb5cb2927253d74abe775d55b527cfb3593a/nodes%2FFakeCrm%2Fdescriptions%2FFakeCrm.description.yaml) modified [59,233,292]

```diff
@@ -1,291 +1,117 @@
 resources:
 
-  group:
-    display: Group
+  post:
     defaultOperation: getAll
-
     operations:
 
       create:
-        notImplemented: true
-        display: Create
-        method: POST
-        path: /groups
         params:
-          - $link: cmn.additionalFields
-            options:
-              - Group.name
-              - Group.limit
-              - Group.customField
-              - Group.email
-
-      createMulti:
-        notImplemented: true
-        display: Create Multiple
-        method: POST
-        path: /groups
-        desc: Create Multiple Groups
-        params:
-          - name: groups
-            displayName: Groups
+          - name: tags
             type: fixedCollection
             typeOptions:
               multipleValues: true
             options:
-              - name: groupProperties
+              - name: tagProps
                 values:
-                  - Group.name
-                  - Group.limit
-                  - Group.customField
-                  - Group.email
-
-      get:
-        display: View Group
-        method: GET
-        path: /groups/{id}
-        params:
-          - Group.id
-
-      getUsers:
-        display: List Group's Users
-        method: GET
-        path: /groups/{id}/users
-        desc: View Group's Users List
-        params:
-          - Group.id
-          - $link: cmn.additionalFields
-            options:
-              - cmn.page
-              - cmn.limit
-      getAll:
-        # Same operation for search: {{host}}/api/v2/groups/search/finance?filter=capped
-        display: List Groups
-        method: GET
-        path: /groups
-        desc: List/Search groups
-        params:
+                  - Post.tag
           - $link: cmn.additionalFields
             options:
-              - name: search
-                displayName: Search String
-                description: The search will be conducted on the group's name, group's custom code and group's notification email address
-              - name: filter
-                type: options
-                options:
-                  - capped
-                  - unassigned
-              - cmn.page
-              - cmn.limit
+              - Post.title
+              - Post.createTime
+              - Post.author
+              - Post.content
 
       update:
-        notImplemented: true
-        display: Update Group
-        method: PUT
-        path: /groups
         params:
-          - Group.id
-          - $link: cmn.additionalFields
-            options:
-              - Group.name
-              - Group.limit
-              - Group.customField
-              - Group.email
-
-      updateMulti:
-        notImplemented: true
-        display: Update Multiple Groups
-        method: PUT
-        path: /groups
-        params:
-          - name: groups
+          - Post.id
+          - name: tags
             type: fixedCollection
             typeOptions:
               multipleValues: true
             options:
-              - name: groupChoice
+              - name: tagProps
                 values:
-                  - Group.id
-                  - name: groupFields
-                    displayName: Group Fields
-                    type: collection
-                    options:
-                      - Group.name
-                      - Group.limit
-                      - Group.customField
-                      - Group.email
+                  - Post.tag
+          - $link: cmn.additionalFields
+            options:
+              - Post.title
+              - Post.createTime
+              - Post.author
+              - Post.content
 
-      suspend:
-        notImplemented: true
-        display: Suspend Group
-        method: PUT
-        path: /groups/suspend
+      get:
         params:
-          - Group.id
+          - Post.id
 
-      unsuspend:
-        notImplemented: true
-        display: Unsuspend Group
-        method: PUT
-        path: /groups/unsuspend
-        params:
-          - Group.id
+      getAll:
+        params: []
 
       delete:
-        notImplemented: true
-        display: Delete Group
-        method: DELETE
-        path: /groups
         params:
-          - name: items
-            displayName: "Item's IDs"
-            type: fixedCollection
-            typeOptions:
-              multipleValues: true
-            options:
-              - name: itemChoice
-                values:
-                  - Group.id
+          - Post.id
 
-  sim:
-    display: SIM
-    defaultOperation: getAll
 
+  comment:
+    defaultOperation: getAll
     operations:
 
-      getAll:
-        display: List SIMs
-        method: GET
-        path: /sims
+      create:
         params:
+          - Comment.postId
           - $link: cmn.additionalFields
             options:
-              - name: query
-                type: options
-                options:
-                  - unassigned
-                  - capped
-              - cmn.page
-              - cmn.limit
+              - Comment.createTime
+              - Comment.author
+              - Comment.content
 
-      get:
-        display: View SIM
-        method: GET
-        path: /sims/{cellnumber}
-        desc: View SIM (including Location services)
-        params:
-          - name: cellnumber
-            displayName: Cell Number
-            type: number
-            description: Cell number must be a valid cellnumber on the APN
-
-      search:
-        display: Search SIMs
-        method: GET
-        path: /sims/search/{search}
-        desc: |
-          The search term must not contain special characters.
-          The search will be conducted on the following
-          - cellnumber (MSISDN)
-          - SIM serial (ICCID)
-          - SIM name
-          - SIM IP Address
-          Pagination does not apply to this endpoint.
-        params:
-          - name: search
-
-      # ToDo: Do we need to implement multi item operation for: update, assign, unassign, suspend, unsuspend
       update:
-        notImplemented: true
-        display: Update SIM
-        method: PUT
-        path: /sims
         params:
-          - Sim.cellNumber
+          - Comment.postId
+          - Comment.id
           - $link: cmn.additionalFields
             options:
-              - Sim.realm
-              - Sim.name
-              - Sim.serial
-
-      assign:
-        notImplemented: true
-        display: Assign SIM to User
-        method: PUT
-        path: /sims/assign
-        params:
-          - Sim.cellNumber
-          - Sim.userID
-          - Sim.realm
+              - Comment.createTime
+              - Comment.author
+              - Comment.content
 
-      unassign:
-        notImplemented: true
-        display: Unassign SIM from APN User
-        method: PUT
-        path: /sims/unassign
-        params:
-          - Sim.cellNumber
-          - Sim.userID
-          - Sim.realm
-
-      suspend:
-        notImplemented: true
-        display: Suspend SIM
-        method: PUT
-        path: /sims/suspend
+      get:
         params:
-          - Sim.cellNumber
-          - Sim.realm
+          - Comment.postId
+          - Comment.id
 
-      unsuspend:
-        notImplemented: true
-        display: Unsuspend SIM
-        method: PUT
-        path: /sims/unsuspend
+      getAll:
         params:
-          - Sim.cellNumber
-          - Sim.realm
+          - Comment.postId
 
-      listUsageByDate:
-        # Sample request: /sims/2021-12-14/daily?page=1&limit=50
-        display: SIMs Usage by Date
-        method: GET
-        path: /sims/{date}/daily
-        desc: List SIMs Daily Usage by Date
+      delete:
         params:
-          - name: date
-            type: dateTime
-          - $link: cmn.additionalFields
-            options:
-              - cmn.page
-              - cmn.limit
+          - Comment.postId
+          - Comment.id
 
 
 models:
   cmn: # Common fields
-    - name: page
-      type: number
-    - name: limit
-      type: number
     - name: additionalFields
       type: collection
       placeholder: Add Field
 
-  Group:
+  Post:
     - name: id
-      displayName: Group ID
-      type: number
-    - name: customField
       type: number
-    - name: name
-    - name: limit
+    - name: title
+    - name: createTime
+      type: dateTime
+    - name: tag
+    - name: author
+    - name: content
+
+  Comment:
+    - name: postId
+      displayName: Post ID
       type: number
-    - name: email
-
-  Sim:
-    - name: cellNumber
-      type: number
-    - name: realm
-    - name: name
-    - name: serial
-    - name: userID
+    - name: id
       type: number
+    - name: createTime
+      type: dateTime
+    - name: author
+    - name: content
```

## nodes/FakeCrm/descriptions/gen.ts<a name="nodes/FakeCrm/descriptions/gen.ts"></a>

- [nodes/FakeCrm/descriptions/gen.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/06e7eb5cb2927253d74abe775d55b527cfb3593a/nodes%2FFakeCrm%2Fdescriptions%2Fgen.ts) modified [5,1,6]

```diff
@@ -1,6 +1,6 @@
 import path from 'path';
 import fs from 'fs';
-import { createMapFromTransformers, Transformers } from '@digital-boss/n8n-node-generator/dist/transform';
+import { createMapFromTransformers, propSetter, Transformers } from '@digital-boss/n8n-node-generator/dist/transform';
 import { TypeName } from '@digital-boss/n8n-node-generator/dist/usecases/res-op/types';
 import { matchType } from '@digital-boss/n8n-node-generator/dist/transform';
 import * as trCmn from '@digital-boss/n8n-node-generator/dist/usecases/res-op/transformers/common';
@@ -16,7 +16,11 @@ import { getJsModuleForNode } from '@digital-boss/n8n-node-generator/dist/codege
 import { getTypesForResourceOperations, writeDescriptionModules } from '@digital-boss/n8n-node-generator/dist/usecases/res-op/helpers';
 import { INodeDescr } from './types';
 
+const setDisplay = propSetter('display', (_, ctx) => trCmn.createDisplayName(ctx.path[ctx.path.length-1].toString()));
+
 const transformers1: Transformers<TypeName, INodeDescr> = [
+	[matchType<TypeName>('Resource'), setDisplay],
+	[matchType<TypeName>('Operation'), setDisplay],
 	[matchType<TypeName>('Param'), [
 		[trCmn.isString, trParam.importFromModel],
 		[trParam.isLink, trParam.linkFromModel],
```

## nodes/FakeCrm/descriptions/types.ts<a name="nodes/FakeCrm/descriptions/types.ts"></a>

- [nodes/FakeCrm/descriptions/types.ts](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/raw/06e7eb5cb2927253d74abe775d55b527cfb3593a/nodes%2FFakeCrm%2Fdescriptions%2Ftypes.ts) modified [2,2,4]

```diff
@@ -9,8 +9,8 @@ export interface IResource extends IResourceBase<IOperation> {
 }
 
 export interface IOperation extends IOperationBase {
-	method: string;
-	path: string;
+	method?: string;
+	path?: string;
 	responseMap?: string | string[];
 }
 
```
