import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ItemExecFn } from './interfaces';
export declare const getNodeExecFn: (execItem: ItemExecFn) => (this: IExecuteFunctions) => Promise<INodeExecutionData[][]>;
