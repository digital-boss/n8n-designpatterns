import { IState } from "../../interfaces";
import { NodeExecutorBase } from "../../NodeExecutorBase";
import { ResOpResolver } from "./ResOpResolver";
import { OperationFn } from "./types";

export class ResOpExecutor<
  TState extends IState, 
  TClient, 
  TResName extends string
> extends NodeExecutorBase<TState> {

	constructor(
		state: TState,
		private resolver: ResOpResolver<OperationFn<TClient, TState>, TResName>,
		private client: TClient,
	) {
		super(state);
	}

	protected executeCurrentItem(): Promise<any> {
		const opFn = this.resolver.getOperationMethod();
		return opFn(this.client, this.state);
	}
}
