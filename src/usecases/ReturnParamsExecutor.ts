import { ExecFnHelperBase } from '../ExecFnHelperBase';
import { NodeExecutorBase } from '../NodeExecutorBase';

export class ReturnParamsExecutor extends NodeExecutorBase<ExecFnHelperBase> {
	executeCurrentItem (): Promise<any> {
		return Promise.resolve(this.node.getAllParams());
	}
}
