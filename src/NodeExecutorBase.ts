import { IState, ItemExecFn } from './interfaces';

/**
 * Node Executor
 */
export abstract class NodeExecutorBase<TState extends IState> {
	itemIndex = 0;
	state: TState;

	constructor(node: TState) {
		this.state = node;
	}

	execute: ItemExecFn = async (itemIndex) => {
		this.itemIndex = itemIndex;
		this.state.updateIndex(this.itemIndex);
		return this.executeCurrentItem();
	}

	/**
	 * Implement here item execution logic
	 */
	protected abstract executeCurrentItem (): Promise<any>;
}
