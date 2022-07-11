import { IExecItemDependance, ItemExecFn } from './interfaces';

/**
 * Node Executor
 */
export abstract class NodeExecutorBase<TExecFn extends IExecItemDependance> {
	itemIndex = 0;
	node: TExecFn;

	constructor(node: TExecFn) {
		this.node = node;
	}

	execute: ItemExecFn = async (itemIndex) => {
		this.itemIndex = itemIndex;
		this.node.updateIndex(this.itemIndex);
		return this.executeCurrentItem();
	}

	/**
	 * Implement here item execution logic
	 */
	protected abstract executeCurrentItem (): Promise<any>;
}
