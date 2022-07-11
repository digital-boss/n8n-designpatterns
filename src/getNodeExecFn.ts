import { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ItemExecFn } from './interfaces';

export const getNodeExecFn = (execItem: ItemExecFn) => async function (this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const length = items.length;
	const returnData: IDataObject[] = [];

	for (let itemIndex = 0; itemIndex < length; itemIndex++) {
		try {
			const result = await execItem(itemIndex);
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
};
