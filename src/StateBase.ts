import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
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

}
