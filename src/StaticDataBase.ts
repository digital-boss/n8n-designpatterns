import { IExecuteFunctions } from 'n8n-workflow';

/**
 * Base class to extend to implement Strongly typed WorkflowStaticData access.
 */
export abstract class StaticDataBase {
	private execFns: IExecuteFunctions;

	constructor(execFns: IExecuteFunctions) {
		this.execFns = execFns;
	}

	protected get global() {
		return this.execFns.getWorkflowStaticData('global');
	}

	protected get node() {
		return this.execFns.getWorkflowStaticData('node');
	}
}
