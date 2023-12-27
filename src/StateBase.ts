import { IDataObject, IExecuteFunctions, IBinaryData } from 'n8n-workflow';
import { IState } from './interfaces';

/**
 * Access Node state, getting parameters.
 */
export class StateBase implements IState {
	itemIndex = 0;
	execFns: IExecuteFunctions;

	constructor (
		execFns: IExecuteFunctions,
	) {
		this.execFns = execFns;
	}

	updateIndex (itemIndex: number) {
		this.itemIndex = itemIndex;
	}

	getParam (name: string): any {
		return this.execFns.getNodeParameter(name, this.itemIndex);
	}
	
	getParams(names: string[]) {
		return names.reduce((acc, i) => {
			acc[i] = this.getParam(i);
			return acc;
		}, {} as any);
	}

	getAllParams (): IDataObject {
		const params = this.execFns.getNode().parameters;
		const paramsWithValues = Object.keys(params).map(name => [name, this.getParam(name)]);
		return Object.fromEntries(paramsWithValues);
	}

	applyPathParams (path: string): string {
		const rx = new RegExp('{[a-zA-Z_][a-zA-Z0-9]*}', 'g');
		const matches = path.match(rx);
		if (matches && matches.length > 0) {
			matches.forEach((match, i) => {
				const value = this.getParam(match.slice(1, -1)) as string;
				if (value !== undefined) {
					path = path.replace(match, value);
				}
			});
		}
		return path;
	}

	isParamExists (name: string): boolean {
		return name in this.execFns.getNode().parameters;
	}

	tryGetParam (name: string) {
		if (this.isParamExists(name)) {
			return this.getParam(name);
		}
		return undefined;
	}

	getBinaryDataBuffer(dataPropertyName: string): Promise<Buffer> {
		return this.execFns.helpers.getBinaryDataBuffer(this.itemIndex, dataPropertyName);
	}

	binaryToBuffer(buffer: Buffer): Promise<Buffer> {
		return this.execFns.helpers.binaryToBuffer(buffer);
	}

	prepareBinaryData(buffer: Buffer): Promise<IBinaryData> {
		return this.execFns.helpers.prepareBinaryData(buffer);
	}

}
