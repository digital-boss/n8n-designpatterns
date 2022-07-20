import { StateBase } from '../StateBase';
import { NodeExecutorBase } from '../NodeExecutorBase';

export class ReturnParamsExecutor extends NodeExecutorBase<StateBase> {
	executeCurrentItem (): Promise<any> {
		return Promise.resolve(this.state.getAllParams());
	}
}
