# n8n Design Patterns Tutorial

"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler. https://faun.pub/solid-principles-a5c650fcf30

## TL/DR



## How to use this repo

git push --all -u



## Compare

- https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/

- [step1...step2](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step1...step2)
- [step2...step3-1](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step2...step3-1)
- [step3-1...step3-2](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step3-1...step3-2)
- [step3-2...step4-1](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step3-2...step4-1)
- [step4-1...step4-2](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step4-1...step4-2)
- [step4-2...step4-3-1](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step4-2...step4-3-1)
- [step4-3-1...step4-3-2](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step4-3-1...step4-3-2)
- [step4-3-2...step4-3-3](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step4-3-2...step4-3-3)
- [step4-3-3...step4-3-4](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step4-3-3...step4-3-4)
- [step4-3-4...step4-4](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step4-3-4...step4-4)
- [step4-4...step5](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step4-4...step5)




Anytime you want to debug:
```ts
		const params0 = this.getNode().parameters;
		const paramsWithValues0 = Object.keys(params0).map(name => [name, this.getNodeParameter(name, 0)]);
		const res0 = Object.fromEntries(paramsWithValues0);
		return [this.helpers.returnJsonArray(res0)];
```

# Step 1: Generate new package and Node

## Generation script

```ts
const baseDir = '/path/to/basedir';

const packageParams = newPackage({
	ns: 'digital-boss',
	suffix: 'designpatterns-tutorial',
	baseDir,
});

const node = newNode({
	package: packageParams,
	nodeName: 'FakeCrm',
	brandColor: '#43a35d',
});

const tasks: Task[] = [
	() => removeIfExists(packageParams.packageDir),
	createPackage(packageParams, 'templates/starter'),
	createNode(node, 'templates/node', 'templates/creds/three-fields.ts'),
	() => exec(`cd ${packageParams.packageDir} && git init`, execLog),
];

const root = new TasksContainer(tasks);
root.run();
```

## Build and run n8n with generated Node

- cd into `n8n-nodes-designpatterns-tutorial` package dir
- npm i
- npm run gen
- npm run build
- npm link
- at n8n local instance
  - `npm link -S @digital-boss/n8n-nodes-designpatterns-tutorial` - add link to new package
  - `npx n8n` - start local instance


# Step 2: Make a UI

[Diff](https://github.com/digital-boss/n8n-nodes-designpatterns-tutorial/compare/step1...step2)

credentials/FakeCrmApi.credentials.ts
nodes/FakeCrm/FakeCrm.node.ts
nodes/FakeCrm/descriptions/FakeCrm.description.yaml
nodes/FakeCrm/descriptions/gen.ts


nodes/FakeCrm/descriptions/types.ts



- FakeCrm.node.ts
  - remove (or add real) icon `icon: 'file:fakeCrm'`
  - add generated description properties to FakeCrm class
- Create node description in yaml for FakeCrm API
- gen.ts: add transformer to setup display name for resources and operations from its names.
- types.ts: make mathod and path parameters for IOperation optional. Later in this tutorial we'll bring them back and make use of them.


# Step 3: Implementing without Separation of Concerns

## Step 3.1: Add boilerplate

```ts
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const length = items.length;
		const returnData: IDataObject[] = [];
		const resource = this.getNodeParameter('resource', 0) as typeof resourcesConst[number];
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let itemIndex = 0; itemIndex < length; itemIndex++) {
			try {
				let result: any;
				switch (resource) {
					case "post":
						switch (operation) {
							case "create":
								result = {resource, operation};
								break;
							case "update":
								result = {resource, operation};
								break;
							case "get":
								result = {resource, operation};
								break;
							case "getAll":
								result = {resource, operation};
								break;
							case "delete":
								result = {resource, operation};
								break;
						}
					break;

					case "comment":
						switch (operation) {
							case "create":
								result = {resource, operation};
								break;
							case "update":
								result = {resource, operation};
								break;
							case "get":
								result = {resource, operation};
								break;
							case "getAll":
								result = {resource, operation};
								break;
							case "delete":
								result = {resource, operation};
								break;
						}
					break;
				}

				if (result.constructor === Array) {
					returnData.push.apply(returnData, result);
				} else {
					returnData.push(result);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: error.message });
					continue;
				}
				throw error;
			}
		}
		return [this.helpers.returnJsonArray(returnData)];
	}
```

## Step 3.2: Implementing

Do you see (potential) problems?
- We need to declare variables outside case clause (see image). But what if different operations has same param, but different type? What if total amount of different parameters in all operations will be big? then variable definition block will be big too, but contains vars for all operations. Mess.
- We could get this code. And it will be successfully compiled. But do you see error? 1. id and postId. 2. easy to forget itemIndex.
```ts
  case "getAll":
    method = 'GET';
    id = this.getNodeParameter('postId', 0) as string;
    path = `/post/${postId}/comment`;
    break;
```
- When list grows - its harder to track on what indentation level you are (is it operation case, or resourse case or ...)
- tagsColl1 tagsColl2
- how to modify result of any specific operation?


# Step 4: Extract

## Step 4.1: Extract input items iteration

- iteration on input items, 
- composing result array, 
- handling continueOnFail.

## Step 4.2: Extract operations functions

- variables problem resolved. Each operation incapsulated in separate method. 
- update operations returns empty result, so we transform result to empty object: `return fakeCrmRequest.call(execFns, method, path, body).then(res => res || {});`. This modifications can't be easily included without extracting operation methods.


## Step 4.3: Apply Separation of Concerns to Operation

- extract client and state
- operation itself become a method that 
	- with the help of State (get parameters, get request options by current operation metadata. Metadata: path, method, headers, etc...)
	- compose request options object
	- and pass it to client.
	- Then transforms response
- convern of o

Examples of clients: HTTP REST, LDAP, WebDAV, XML-RPC, SOAP, gRPC, GraphQL, and so on. 

approaches (from dedicated to universal)
1. Dedicated client (dedicated to Node)
2. Generic with Auth (Basic Auth, OAuth, ...)
3. Raw Protocol implementation.

Dedicated is justified for, for example, Hostbill. But if API has some methods that accepts params in qs, some - body, some - in path (dnd that is the most common scenario), then usualy its more convenient to have universal client. Speaking Universal we mean it can receive OptionsWithUri, but besides just making request, it's responsible for authentication.  


Also without loosing in maintainability we can:
- make client just a co


### Step 4.3.1: Extract client

Before

Сonvert out client from semi-dedicated (that accepts method, path, body) to Generic with Auth. Keeping maintainability, extensibility, readability same, but Reducing the number of entities by one.

As a most common scenario. Out API doen't have authentication, but we can assume, that it has. And see that code doesn't loose in maintainability and readablility. Versatility of client here is just about receiving qs, body and method. But doing this just with OptionsWithUri in Generic Http Client frees us from the need of additional abstraction in the form of Dedicated client. Less entities - better. So keeping maintainability, extendability, readability same, but Reducing the number of entities by one.

Note that OptionsWithUri has auth property - and this is params for Basic Auth. So underlying http client already has implementation for basic auth. But to show how you can implement your own auth methods, I provide here HttpClient with Basic auth implementation. 


Changes:
- IFakeCrmApiCredentials = IBasicAuth
- Workflow. To Copy connections. ToDo: paste the sdame workflow to prev steps
- json

After

### Step 4.3.2: Extract state

- refactor FakeCrm.getItemExecutor
- change operation signature

After

And we can add other usefull methods to State which we are going to do on next steps of our refactoring journey.

### Operation responsibility

### Step 4.3.3: Extract operation metadata to node description (yaml)

configuration vs conventions

If you have a bunch of resources and each of them implements CRUD with same operation names, such as: create, update, get, getAll, delete. And every method uses corresponding HTTP Method: POST, PUT, GET, GET, DELETE. Then we have easily formalisabl rules for http method. And it's better to use convention in this case. On the other hand if operations on resources are different and there is no patterns recognized, then it's better to use configuration.

### Step 4.3.4: Fallback operation

## Step 4.4: Extract operation resolver

# Step 5: Introduce n8n-designpatters