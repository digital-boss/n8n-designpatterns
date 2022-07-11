import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { IExecItemDependance } from './interfaces';
export declare class ExecFnHelperBase implements IExecItemDependance {
    itemIndex: number;
    execFns: IExecuteFunctions;
    constructor(execFns: IExecuteFunctions);
    updateIndex(itemIndex: number): void;
    getParam(name: string): any;
    getAllParams(): IDataObject;
    applyPathParams(path: string): string;
}
